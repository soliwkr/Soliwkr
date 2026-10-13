# SOLIWKR — AIOS unified cockpit, Release Candidate 1

**Status:** DRAFT RELEASE CANDIDATE · NOT DEPLOYED · 2026-10-13
**Canonical destination:** `main` of `soliwkr/Soliwkr`
**Production:** `https://aios.soliwkr.pro` (existing custom domain/Worker/D1 only, never a new cockpit).
**Design:** Cloudflare Think JARVIS resident + existing VPS/laptop as delegated Hermes workers. Telegram is an interface; no bot has been provisioned or switched by this release.

## Why one RC

Previous Life OS work exists in open dependent PRs:

`#7 (V0) → #8 (V1) → #10 (Atlas) → #11 (Obsidian CLI) → #12 (knowledge ledger) → #18 (Access JWT) → #19 (Mission Control) → #20 (GitHub source events)`.

RC1 **contains that stack in one branch** so review/test/release no longer requires hand-tracking and deploying multiple feature branches. Those existing PRs are not closed, merged or deleted automatically. After RC1 review/merge, separately reconcile/close superseded branches with explicit approval. PR #13 V2 design and PR #17 Telegram Think agent are separate by intention.

## What exists in RC1

- Same original Life OS Worker, domain, private D1 and existing data contract.
- Six existing subviews and the seventh Atlas, no second application.
- First-page Mission Control: infrastructure, Jarvis/Hermes, memory, repo portfolio, next gate and Atlas on one overview; manual focus/task entry is OPTIONAL via collapsed details.
- Auth checks Cloudflare Access JWT **cryptographically** using RS256 public JWKS, issuer, AUD, exp/iat/nbf and exactly one configured owner email. Two Access allowlisted emails are NOT automatically both entitled to read one private D1 record.
- Knowledge ledger, authenticated Obsidian ZIP and local ingest/query/lint preserved; no automatic Obsidian sync claimed.
- Automatic GitHub public event collector (hourly), D1 `source_events` dedup and source health, private observation API. Existing data in `private_state` and `knowledge_*` untouched.
- All external missing integrations show unknown/unconnected. No simulated revenue, Stripe data or notifications.

## MUST-PASS release gates (this RC does not waive them)

1. **Owner confirmation:** choose which single Cloudflare Access email is actually permitted to own the existing D1 state. Set `ACCESS_OWNER_EMAIL` as a Cloudflare secret, never in GitHub or issue. Without owner secret the new Worker intentionally DENIES ALL private requests.
2. **Access org/app:** issuer `https://soliwkr.cloudflareaccess.com`, Worker var `ACCESS_APP_AUD` for `aios.soliwkr.pro`, actual JWT login smoke test from chosen owner. Validate the second Access-allowed email receives 401 from all private APIs, even if login succeeded.
3. **D1 recovery:** read-only live backup/snapshot plan and a **restore rehearsal** on isolated test D1 with fake or authorized data. Do not claim the Obsidian ZIP is a consistent backup. Document independent rollback of Worker code vs D1 schema/data.
4. **Migration:** 0002_knowledge.sql already exists in production according to prior checks; verify table/index before running again. 0003_source_events.sql must be applied **first to isolated stage** and then to production (additive) only before enabling cron/observation API. No destructive SQL.
5. **Stage isolation:** separate Worker hostname and fixture D1, custom protected route, no workers.dev/preview bypass. Token issuer and audience must be stage-specific or verified carefully; NEVER connect staging to the production private D1.
6. **Source chain:** pin RC commit SHA into deployment manifest, build/deploy deterministically using Wrangler with correct bindings, preserve prior Worker version as rollback; do not make production drift from review.
7. **End-to-end:** private owner login, home, 7 routed views, three-way module injection, D1 save/refresh, concurrent edits conflict, knowledge card approve/erase, Obsidian ZIP, fake events duplicate/outage and one real public GitHub event.
8. **Privacy:** private content not published to GitHub, CDN, unsafe telemetry or public preview. Telegram/Think not provisioned or granted Access yet.
9. **Costs:** confirm existing Cloudflare Workers billing/cron effect; no VPS purchase, WhatsApp integration, new agent API charge or model auto-work included.

## Release test protocol

```bash
cd cloudflare/life-control-room
npm test
```

GitHub Actions workflow `Life Room contracts` enforces Node 22 tests on PR changes. Passing tests alone does not verify actual Access login, live D1 restore, hosted JS rendering or the user's Android/Obsidian configuration.

## ROLLBACK

- If deployment breaks login, restore previous Worker version/build **without altering D1**; disable cron while investigating. Never silently enable a broken access policy.
- Schema `source_events` / `source_checks` is additive. Rollback application code first, leave tables intact until retention/consent is reviewed.
- If source API fails, mark source status UNKNOWN, never "healthy" or "0".
- Previously downloaded Obsidian ZIPs are not remotely revocable.

## Known debt (not hidden)

- `private_state` still stores focus/goals/inbox as a single JSON record (up to 30 current notes), with 409 optimistic concurrency. There is no complete time-series journal yet.
- User is not required to input data for the new overview, but some legacy manual controls remain as optional.
- Messenger agent PR #17 is an unprovisioned draft; VPS Hermes status is unverified. Laptop-off test is not completed.
- Event collector is GitHub **public** events only; no Cloudflare deployment or Black Office economic feed yet.
- Karpathy real autonomous LLM wiki curator is not active, local CLI + export are real.
- Main branch is not yet the deployed code until this RC is reviewed, merged and released.

**Next human decision:** select the primary owner identity inside the existing Cloudflare Access policy (one-time), then carry out G0 backup/staging and controlled release. No rearchitecture or new cockpit.

## G0 staging implementation log — 2026-10-13

- Owner selected explicitly in conversation. The email is set in Cloudflare **secret bindings** on both current production script and isolated staging script; no email is hard-coded in the repository. Production's current Worker code does not yet consume that secret, so the *new* owner gate remains to be deployed.
- Verified the selected owner is included in the existing Access application's allowed principals; its nonsecret application AUD matches the RC configuration. Existing policy retains two principals, but new Worker verifies one owner.
- Created **EU-jurisdiction fixture-only D1** `soliwkr-life-room-rc1-staging`, verified the base and additive source/knowledge migrations, inserted only synthetic state and a synthetic technical event.
- Tested D1 point-in-time recovery in staging: take bookmark → intentionally edit fixture/delete event → restore to bookmark → verify original version/payload and event are present again. **PASS.** Production D1 PITR bookmark availability also confirmed, but no external full backup has yet been created.
- Created separate Cloudflare Access staging application with **owner-only policy** and different app audience.
- Created Worker `soliwkr-life-room-stage` using this RC source and isolated fixture D1. Configured stage host/app AUD and owner secret; disabled `workers.dev` and preview URLs.
- Mapped `aios-stage.soliwkr.pro` to that Worker. Unauthenticated Browser Rendering snapshot **PASS**: Access sign-in displayed; no Life OS content or private data visible.
- **PENDING HUMAN GATE:** authenticated owner login through Access staging app and real 200 response from Mission Control. There is a distinct Access team hostname presented in the login UI; do not assume JWT issuer matches configured one until this test passes. On 401, inspect signed assertion claims securely and adjust fixed issuer and JWKS after confirming the actual application owner. Do not weaken signature or owner checks.
- **PENDING RELEASE GATE:** actual production snapshot/export backup and rollback plan; production D1 `0003_source_events.sql`; production Worker deployment to pinned RC commit; authenticated production smoke and one real event observed. No production private data moved into staging.
- Never publish an Access JWT, application session, email secret, raw notes or backup SQL in this public repository.


### Staging login 401 — investigation 2026-10-13

An owner screenshot showed `Access authentication required` after login on stage. That text is the Worker-side 401 response, so Cloudflare Access login alone is insufficient proof of accepting the JWT.

Read-only Cloudflare API findings:
- The Access organization has a login display team name `teamchris.cloudflareaccess.com`, **but the configured authentication/JWKS domain is `soliwkr.cloudflareaccess.com`**.
- Public JWKS was accessible on `https://soliwkr.cloudflareaccess.com/cdn-cgi/access/certs`; the `teamchris` JWKS URL did not yield keys in Browser Rendering. Do not rely on the UI display name as JWT issuer.
- Staging audience, D1 fixture-only binding and `ACCESS_OWNER_EMAIL` secret were present and correct.

Remediation in RC branch:
- Made `ACCESS_TEAM_DOMAIN` an explicit, allowlisted HTTPS cloudflareaccess.com environment binding (non-user supplied); public keys, issuer and JWT signature validated against that configured team domain, never against request host.
- Added coarse failure reason codes to `evaluateAccessRequest`. These appear **only** when `AIOS_HOST='aios-stage.soliwkr.pro'` AND `AIOS_AUTH_DIAGNOSTICS='enabled'`. No JWT, claims, email or cookies are logged or echoed, and production never reveals diagnostic reasons.
- Redeployed **staging Worker only** after CI PASS, preserved owner secret and isolated D1 binding, verified public unauthenticated request still shows Cloudflare Access login rather than content.
- **RETEST NEEDED:** owner should refresh stage. If still denied, report only the bracketed `stage-check: <code>` to identify the failing check, no token/cookies. Do not infer that authentication is fixed until the genuine signed session returns HTTP 200.


### Staging certificate fetch incident: temporary public-key fallback (2026-10-13)

- Owner JWT reached the Worker and passed issuer/audience/owner/time checks but failed at `stage-check: certificates`.
- The publicly available `https://soliwkr.cloudflareaccess.com/cdn-cgi/access/certs` was independently inspected over TLS and returned **two valid RS256 RSA public keys**; the browser Access login label `teamchris` is **not** the configured auth issuer.
- Staging Worker now classifies certificate-failure causes (`cert-fetch`, `cert-http`, `cert-json`, `cert-keys`, etc.) with stage-only coarse codes. No token, cookie, key data or private claims are exposed.
- **Temporary stage-only resilience:** `STAGE_JWKS_FALLBACK=enabled` and Cloudflare `STAGE_ACCESS_JWKS` secret binding hold a snapshot of the *public keys only*, captured from the official HTTPS cert endpoint. The fallback accepts keys solely when issuer matches and capture age is under **24h**. Each JWT still must pass strict RS256 cryptographic signature, owner email, issuer, exact app AUD, `iat` and `exp`. No fallback enabled in production.
- Stage code deployed at commit `ce6d8ca598abe68703a0c34c978c6c90a11e0fe3`; GitHub Actions [PASS](https://github.com/soliwkr/Soliwkr/actions/runs/38425798654) including negative tests for forged tokens, wrong owner and expired pin.
- Verified via Cloudflare API: isolated EU fixture D1 remains bound, owner secret and pin bindings present, `workers.dev` and preview URLs disabled, anonymous request shows Cloudflare Access login, not the cockpit.
- **PENDING:** user refresh with real owner session to confirm HTTP 200. This is not a production fix; determine why staging Worker cannot fetch JWKS in real runtime, and create a tested **rotation-safe** certificate retrieval strategy before deploying verified Access security on the production domain. The static fallback is intentionally short-lived and stage-only.



### Verified runtime-backed Access identity — 2026-10-13

- The owner confirmed that authenticated staging **loaded and worked** with the previously configured short-lived public-JWKS fallback (user acceptance of the cockpit, not an attestation of all integrations).
- Cloudflare officially offers `ctx.access` to Workers directly authenticated by Access, including an application `aud` and `getIdentity().email`. See https://developers.cloudflare.com/workers/configuration/cloudflare-access/ . It does not propagate across service binding invocations.
- `access-platform.js` now validates a **runtime-provided** Cloudflare Access context, exact application AUD and the explicitly configured owner email. This is a separate trust path; it does not accept request-supplied identity headers.
- The revised Worker is **dual-path**: if `AIOS_PLATFORM_AUTH=enabled` and a runtime Access context exists, use it and deny mismatched owner/AUD; otherwise use cryptographically verified JWT with public keys. This does not permit unauthenticated service-binding requests through.
- Tested on stage first in `observe` mode, with JWT still authoritative. A stage-only fixture database status entry recorded `access_runtime/ctx_access: status=ok,error_code=platform` at 2026-10-13 16:14 UTC (no email, JWT or PII stored). This confirms a real Access-protected request reached the Worker with valid native owner and audience.
- Switched **staging only** to `AIOS_PLATFORM_AUTH=enabled` at 2026-10-13 16:15 UTC. The separate EU fixture-only D1 binding, owner secret and policy remained intact; staging is awaiting repeat authenticated end-to-end smoke after the switch.
- Production's **repository configuration**, not its running Worker, now includes `AIOS_PLATFORM_AUTH=enabled` for the future approved deployment. Production intentionally has **no** `STAGE_JWKS_FALLBACK` or `STAGE_ACCESS_JWKS` binding; the public-key snapshot is not an authorized production authentication mechanism.
- Tests cover the native Access context being unavailable (JWT required), correct owner+aud, wrong owner+aud and missing/failed identity lookup. Signed JWT still fails closed on forged/expired credentials. `AIOS_PLATFORM_AUTH` is an operator-only Worker configuration variable, never accepted from a request.
- **Release blockers remain**: an independently documented production data backup/export and recovery rehearsal or agreed PITR rollback, controlled D1 0003 migration, review/merge approval, actual production 200/401 authorization smoke, one real GitHub event and release SHA traceability. No production rollout has occurred.

