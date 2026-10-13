// Fail-closed Cloudflare Access application JWT verification.
// No external dependencies, no user-controlled JWKS URL, no identity in logs.
// The Access team's real issuer is an environment-specific AUTHORIZATION fact.
// Never infer it from the request Host, the JWT itself, or the application domain.
function teamIssuer(env) {
  const candidate = env?.ACCESS_TEAM_DOMAIN;
  if (typeof candidate !== "string") return null;
  try {
    const u = new URL(candidate);
    if (u.protocol !== "https:" || !/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(u.hostname) ||
        u.port || u.username || u.password || u.pathname !== "/" || u.search || u.hash) return null;
    return u.origin;
  } catch { return null; }
}
const ALG = "RS256";
const JWKS_TTL_MS = 5 * 60 * 1000;
const MAX_TOKEN_CHARS = 16000;
let cachedKeys = null;
let cachedIssuer = null;
let cacheUntil = 0;

function base64urlToBytes(source) {
  if (typeof source !== "string" || !source || !/^[A-Za-z0-9_-]+$/.test(source)) throw new Error("Invalid encoding");
  const raw = atob(source.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - source.length % 4) % 4));
  return Uint8Array.from(raw, c => c.charCodeAt(0));
}

function jsonPart(part) {
  const result = JSON.parse(new TextDecoder().decode(base64urlToBytes(part)));
  if (!result || typeof result !== "object" || Array.isArray(result)) throw new Error("Invalid JWT JSON");
  return result;
}

function checkClaims(claims, env, now, issuer) {
  const expectedAudience = env.ACCESS_APP_AUD;
  const expectedOwner = env.ACCESS_OWNER_EMAIL;
  if (!/^[0-9a-f]{64}$/i.test(expectedAudience || "")) return false;
  if (typeof expectedOwner !== "string" || !expectedOwner.includes("@")) return false;

  if (claims.iss !== issuer && claims.iss !== issuer + "/") return false;
  if (!(claims.aud === expectedAudience || (Array.isArray(claims.aud) && claims.aud.includes(expectedAudience)))) return false;
  if (typeof claims.sub !== "string" || !claims.sub.trim()) return false;

  // No guess about the owner: explicitly provision a single email after confirmation.
  if (typeof claims.email !== "string" ||
      claims.email.trim().toLowerCase() !== expectedOwner.trim().toLowerCase()) return false;

  const seconds = Math.floor(now / 1000);
  // Cloudflare Access must provide valid numeric issued/expires claims.
  if (!Number.isInteger(claims.iat) || claims.iat > seconds + 30) return false;
  if (!Number.isInteger(claims.exp) || claims.exp <= seconds) return false;
  if (claims.nbf !== undefined && (!Number.isInteger(claims.nbf) || claims.nbf > seconds)) return false;
  return true;
}

async function publicKeys(issuer, now, fetcher) {
  if (cachedKeys && cachedIssuer === issuer && now < cacheUntil) return cachedKeys;
  const response = await fetcher(issuer + "/cdn-cgi/access/certs", {
    headers: { Accept: "application/json" },
    redirect: "error"
  });
  if (!response.ok) throw new Error("JWKS unavailable");
  const body = await response.text();
  if (body.length > 120000) throw new Error("Oversized JWKS");
  const json = JSON.parse(body);
  if (!Array.isArray(json.keys) || json.keys.length > 25) throw new Error("Invalid JWKS");
  const keys = json.keys.filter(key =>
    key && key.kty === "RSA" && typeof key.kid === "string" &&
    typeof key.n === "string" && typeof key.e === "string" &&
    (key.use === undefined || key.use === "sig") &&
    (key.alg === undefined || key.alg === ALG)
  );
  if (!keys.length) throw new Error("No acceptable JWKS keys");
  cachedKeys = keys;
  cachedIssuer = issuer;
  cacheUntil = now + JWKS_TTL_MS;
  return keys;
}

/** Always returns false on configuration, parsing, signature, or claims failure. */
export async function verifyAccessRequest(request, env, fetcher = fetch, now = Date.now()) {
  try {
    const issuer = teamIssuer(env);
    if (!issuer || typeof env.ACCESS_APP_AUD !== "string" || typeof env.ACCESS_OWNER_EMAIL !== "string") return false;
    const token = request.headers.get("cf-access-jwt-assertion");
    if (!token || token.length > MAX_TOKEN_CHARS) return false;
    const pieces = token.split(".");
    if (pieces.length !== 3) return false;

    const header = jsonPart(pieces[0]);
    const claims = jsonPart(pieces[1]);
    if (header.alg !== ALG || typeof header.kid !== "string" || !header.kid ||
        !checkClaims(claims, env, now, issuer)) return false;

    let keys = await publicKeys(issuer, now, fetcher);
    let key = keys.find(k => k.kid === header.kid);
    if (!key) {
      // Signing key rotation: discard cache once, then fetch a current JWKS.
      cacheUntil = 0;
      keys = await publicKeys(issuer, now, fetcher);
      key = keys.find(k => k.kid === header.kid);
    }
    if (!key) return false;

    const publicKey = await crypto.subtle.importKey(
      "jwk", key, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false, ["verify"]
    );
    const signingInput = new TextEncoder().encode(pieces[0] + "." + pieces[1]);
    const signature = base64urlToBytes(pieces[2]);
    return crypto.subtle.verify("RSASSA-PKCS1-v1_5", publicKey, signature, signingInput);
  } catch {
    return false;
  }
}
