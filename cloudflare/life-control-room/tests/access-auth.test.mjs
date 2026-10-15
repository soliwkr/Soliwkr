import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { verifyAccessRequest } from "../src/access-auth.js";
import worker from "../src/index.js";
import { AUD, OWNER, ENV_AUTH, JWKS, createToken, mockJwksFetch, installJwksFixture } from "./auth-fixture.mjs";

installJwksFixture();
const BASE = "https://aios.soliwkr.pro";
const request = token => new Request(BASE + "/api/vault", token ? { headers: { "cf-access-jwt-assertion": token } } : {});

test("correctly signed Access RS256 JWT for single explicit owner is allowed", async () => {
  assert.equal(await verifyAccessRequest(request(createToken()), ENV_AUTH, mockJwksFetch), true);
  assert.equal(await verifyAccessRequest(request(createToken({ aud: [AUD, "another"] })), ENV_AUTH, mockJwksFetch), true);
});

test("reject missing, tampered and forged Access JWT", async () => {
  assert.equal(await verifyAccessRequest(request(null), ENV_AUTH, mockJwksFetch), false);
  assert.equal(await verifyAccessRequest(request("not.a.jwt"), ENV_AUTH, mockJwksFetch), false);
  const proper = createToken();
  const pieces = proper.split(".");
  const badPayload = Buffer.from(JSON.stringify({ admin: true, email: OWNER })).toString("base64url");
  assert.equal(await verifyAccessRequest(request([pieces[0], badPayload, pieces[2]].join(".")), ENV_AUTH, mockJwksFetch), false);
  const fakeKeys = generateKeyPairSync("rsa", { modulusLength: 2048 });
  assert.equal(await verifyAccessRequest(request(createToken({}, fakeKeys.privateKey)), ENV_AUTH, mockJwksFetch), false);
  const algNone = Buffer.from(JSON.stringify({ kid: "fixture-test-kid", alg: "none" })).toString("base64url");
  assert.equal(await verifyAccessRequest(request([algNone, pieces[1], pieces[2]].join(".")), ENV_AUTH, mockJwksFetch), false);
});

test("owner, issuer, audience and token clock boundaries are mandatory", async () => {
  const now = Math.floor(Date.now() / 1000);
  for (const props of [
    { aud: "wrong" },
    { aud: [] },
    { iss: "https://evil.example" },
    { email: "different-owner@example.test" },
    { email: "" },
    { sub: "" },
    { exp: now - 1 },
    { iat: now + 3600 },
    { nbf: now + 3600 },
    { exp: "never" },
    { iat: "yesterday" },
  ]) {
    assert.equal(await verifyAccessRequest(request(createToken(props)), ENV_AUTH, mockJwksFetch), false, JSON.stringify(props));
  }
  assert.equal(await verifyAccessRequest(request(createToken()), { ...ENV_AUTH, ACCESS_OWNER_EMAIL: "" }, mockJwksFetch), false);
  assert.equal(await verifyAccessRequest(request(createToken()), { ...ENV_AUTH, ACCESS_APP_AUD: "wrong" }, mockJwksFetch), false);
  assert.equal(await verifyAccessRequest(request(createToken()), {}, mockJwksFetch), false);
  assert.equal(await verifyAccessRequest(request(createToken()), { ...ENV_AUTH, ACCESS_TEAM_DOMAIN: "" }, mockJwksFetch), false);
  assert.equal(await verifyAccessRequest(request(createToken()), { ...ENV_AUTH, ACCESS_TEAM_DOMAIN: "https://evil.example" }, mockJwksFetch), false);
  assert.equal(await verifyAccessRequest(request(createToken()), { ...ENV_AUTH, ACCESS_TEAM_DOMAIN: "https://teamchris.cloudflareaccess.com.evil.example" }, mockJwksFetch), false);
  assert.equal(await verifyAccessRequest(request(createToken()), { ...ENV_AUTH, ACCESS_TEAM_DOMAIN: "https://soliwkr.cloudflareaccess.com/path" }, mockJwksFetch), false);
  assert.equal(await verifyAccessRequest(request(createToken({iss:"https://teamchris.cloudflareaccess.com"})), ENV_AUTH, mockJwksFetch), false);
});

test("unavailable JWKS or unknown signing key fails closed", async () => {
  const fakeJwks = async () => Response.json({ keys: [] });
  // A current unknown key must force a refreshed JWKS lookup and then denial.
  const real = createToken();
  const parts = real.split(".");
  const unknown = Buffer.from(JSON.stringify({ kid: "unknown-key", alg: "RS256" })).toString("base64url");
  const req = request([unknown, parts[1], parts[2]].join("."));
  assert.equal(await verifyAccessRequest(req, ENV_AUTH, fakeJwks), false);
  assert.equal(await verifyAccessRequest(req, ENV_AUTH, async () => { throw new Error("unavailable"); }), false);
});

test("every private Worker path is denied without a valid Access token", async () => {
  const env = { LIFE_DB: {}, ...ENV_AUTH };
  for (const path of ["/", "/api/health", "/api/state", "/api/projects", "/api/knowledge", "/api/vault", "/api/knowledge/00000000-0000-0000-0000-000000000000"]) {
    assert.equal((await worker.fetch(new Request(BASE + path), env)).status, 401, path + " no token");
    assert.equal((await worker.fetch(new Request(BASE + path, { headers: { "cf-access-jwt-assertion": createToken({ email: "other@example.test" }) } }), env)).status, 401, path + " wrong owner");
  }
});
