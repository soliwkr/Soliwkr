import { generateKeyPairSync, sign } from "node:crypto";

export const AUD = "0a87f834676c8fee00a8c4dd2914f12ecebdde528da490ee522682ea0c71b099";
export const OWNER = "fixture-owner@example.test";
export const ENV_AUTH = { ACCESS_APP_AUD: AUD, ACCESS_OWNER_EMAIL: OWNER, ACCESS_TEAM_DOMAIN: 'https://soliwkr.cloudflareaccess.com' };
const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const publicJwk = publicKey.export({ format: "jwk" });
export const JWKS = { keys: [{ ...publicJwk, kid: "fixture-test-kid", use: "sig", alg: "RS256" }] };

const encoded = value => Buffer.from(JSON.stringify(value)).toString("base64url");
export function createToken(overrides = {}, key = privateKey) {
  const seconds = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", kid: "fixture-test-kid", typ: "JWT" };
  const payload = {
    iss: "https://soliwkr.cloudflareaccess.com",
    aud: AUD,
    sub: "fixture-sub",
    email: OWNER,
    iat: seconds - 10,
    exp: seconds + 3600,
    ...overrides
  };
  const input = encoded(header) + "." + encoded(payload);
  const signature = sign("RSA-SHA256", Buffer.from(input), key).toString("base64url");
  return input + "." + signature;
}
export const signedSession = () => ({ "cf-access-jwt-assertion": createToken() });
export const mockJwksFetch = async url => {
  if (url !== "https://soliwkr.cloudflareaccess.com/cdn-cgi/access/certs") return new Response("Not found", { status: 404 });
  return Response.json(JWKS);
};
// This only intercepts the fixed public key endpoint, not external app calls.
export function installJwksFixture() {
  const original = globalThis.fetch;
  globalThis.fetch = (request, options) => {
    const url = typeof request === "string" ? request : request.url;
    if (url === "https://soliwkr.cloudflareaccess.com/cdn-cgi/access/certs") return mockJwksFetch(url);
    return original(request, options);
  };
  return () => { globalThis.fetch = original; };
}
