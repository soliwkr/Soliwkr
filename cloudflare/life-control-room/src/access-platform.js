// Cloudflare runtime-verified Access context (not a request-supplied header).
// See https://developers.cloudflare.com/workers/configuration/cloudflare-access/
// A service binding does not propagate ctx.access; unauthenticated contexts stay
// unavailable and MUST pass cryptographically verified JWT instead.
export async function evaluatePlatformAccess(ctx, env) {
  if (!ctx || !ctx.access) return { available: false, ok: false, code: "platform-unavailable" };

  const access = ctx.access;
  if (typeof env?.ACCESS_APP_AUD !== "string" ||
      !/^[0-9a-f]{64}$/i.test(env.ACCESS_APP_AUD) ||
      typeof env?.ACCESS_OWNER_EMAIL !== "string" ||
      !env.ACCESS_OWNER_EMAIL.includes("@")) {
    return { available: true, ok: false, code: "configuration" };
  }
  if (typeof access.aud !== "string" || access.aud !== env.ACCESS_APP_AUD) {
    return { available: true, ok: false, code: "platform-aud" };
  }
  if (typeof access.getIdentity !== "function") {
    return { available: true, ok: false, code: "platform-identity-unavailable" };
  }

  let identity;
  try { identity = await access.getIdentity(); }
  catch { return { available: true, ok: false, code: "platform-identity-unavailable" }; }

  if (typeof identity?.email !== "string" ||
      identity.email.trim().toLowerCase() !== env.ACCESS_OWNER_EMAIL.trim().toLowerCase()) {
    return { available: true, ok: false, code: "platform-owner" };
  }
  return { available: true, ok: true, code: "platform" };
}
