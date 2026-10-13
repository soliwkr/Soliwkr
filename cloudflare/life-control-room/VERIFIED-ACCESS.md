# Life OS — G0 verified Cloudflare Access before Jarvis integration

**Implementation branch:** `feat/life-room-verified-access` based on deployed V1.4 source, not a new cockpit.
**Safety:** This PR is not deployed. All existing personal D1 data stay untouched.

## Threat addressed

Cloudflare Access currently allows **two distinct email identities**, but the Life OS persists one `private_state.id='main'` document and one knowledge ledger, not one per identity. A successful Cloudflare Access login alone **does not** authorize sharing that owner's intimate data. Existing Worker only checks for the presence of `cf-access-jwt-assertion`.

## Implemented defense

`src/access-auth.js` verifies, for **every private request**:
- Fixed expected issuer `https://soliwkr.cloudflareaccess.com` (Cloudflare Access organization, retrieved read-only from account).
- Exact expected Access **application AUD**, from configurable `ACCESS_APP_AUD`.
- RS256 signature against the organization's `/cdn-cgi/access/certs` JWKS; only RSA verification keys; cache TTL 5m and forced refresh on unknown `kid`.
- `iat` / `exp` / optional `nbf`, nonempty `sub`, valid token form and size.
- Owner's verified `email` claim matches a single explicitly configured `ACCESS_OWNER_EMAIL`, **not either of the two allowed email identities**.
- Any missing config/key/network failure or invalid token → HTTP 401. Nothing private is revealed.

Uses native WebCrypto; zero runtime dependencies. JWKS public keys are not secrets. Source data and emails are never logged.

## Operational config required before deploy

- `ACCESS_APP_AUD`: the Access application audience; non-secret. Must be configured in the Worker deployed environment, never supplied by a request.
- `ACCESS_OWNER_EMAIL`: single *confirmed owner* email, as a Cloudflare secret, NOT committed or pasted to GitHub.
- `LIFE_DB`: keep existing D1 binding, unchanged.
- `soliwkr.cloudflareaccess.com`: fixed organization/team issuer; if Access org changes, review code/tests and do not deploy blind.

A public screenshot/chat can never select which of the two allowed Access principals should be the owner. **Ask for explicit approval/identity verification at this gate.** An optional second admin email does not become authorized to read this personal D1.

## Release procedure / rollback

1. Confirm the owner's login identity via secure Access method and provision owner secret (no secret values in issue/GitHub).
2. Record current Worker deployment version and D1 backup strategy before touching production. Restore rehearsal in isolated database is a separate G0 gate, not completed here.
3. Build reproducibly from this GitHub SHA, run tests, stage against a separate fixture D1 and protected route.
4. Test legitimate owner login, nonowner allowlisted email denial, token expiry and wrong-aud signed JWT denial. Test all private endpoints and ZIP.
5. Before production, confirm original custom domain still has Access policy and `workers.dev`/preview routes remain disabled.
6. Deploy using reviewed manifest with existing D1; do not mutate schema. Run authenticated smoke test, log SHA/Worker version. On failure restore previous Worker version and Access config without touching D1.

## Test contract

`npm test` includes prior UI/vault/state contract tests **now using cryptographically signed ephemeral RS256 fixtures**, plus forged token, wrong issuer/audience/owner, expired, not-before, malformed, bad signature, unconfigured owner, unavailable JWKS and denial of all routes.

## Limitations / next P0 gates

- This is a single-owner authorization boundary; a shared/family multi-user AIOS later requires tenant-isolated rows and explicit migration. Do not give the second allowlisted email access to the same state by default.
- Access JWT rotation depends on live JWKS endpoint; short cache and new-kid refresh are supported.
- CSP still uses inline JS/CSS; move to external assets in official React starter later.
- No D1 restore drill or two-tab conflict resolution is implied by passing the auth tests.
- Jarvis Cloudflare Think / Hermes still must not get broad D1 rights: use separate scoped service identity and policy, no arbitrary Access JWT forwarding.
