# LIFE OS V2 — DELIVERY PACKET & G0 HARDENING
**Planning only:** no automatic migration, deployment, merge, connector authorization or secrets creation.
**Owner:** Chris · **Repository:** soliwkr/Soliwkr
**Related:** MASTER-DESIGN.md and EXPERIENCE-SPEC.md.

## Branch reality — not negotiable

The GitHub default branch MAIN does not yet include the Life Room application currently running under the protected custom domain. The PR stack is:
- #7 feat/life-control-room-v0 → main
- #8 feat/life-room-v1-navigation → #7 head
- #10 feat/life-room-knowledge-graph-obsidian → #8 head
- #11 feat/life-room-wiki-engine → #10 head
- #12 feat/life-room-memory-ledger → #11 head

All five were OPEN at the 2026-10-12 audit. The private Worker is deployed from the latest branch, and CI for the V1.4 head passed. **No new production features until git→release traceability is restored.** Do not merge branches in random order; do not close PRs to "clean up" without reviewing their changes.

## P0—01 Runtime identity

Current code checks the **presence** of the Access assertion header. This is not JWT verification. Cloudflare explicitly requires validation of signature, issuer and audience. Threat: a future alternate origin/preview/misrouted Worker route, or API configuration error, may treat a forged or wrong-audience header as authenticated.

Proposed implementation:
1. Introduce an auth boundary for ALL private routes, including GET /, /api/state, /api/knowledge, /api/vault, /api/projects. Protect no endpoint with a weaker check.
2. Use Cloudflare-approved jose createRemoteJWKSet + jwtVerify with a **fixed expected issuer** from a nonsecret configuration variable and a **fixed expected application audience**, not derived from caller input. Cache/reuse remote JWKS according to library behavior.
3. Claim checks: accepted type app, valid signature, current nbf/iat/exp, expected aud and issuer, authorized subject/identity when access policy is broader than one user. Reject JWT for a different CF Access application.
4. Confirm ability to rotate signing keys; fail closed when JWKS unavailable or misconfigured. Avoid printing token/payload/email in logs.
5. Preserve Cloudflare Access external policy and disabled workers.dev; avoid treating those perimeter controls as replacement for origin-side verification.
6. Separate unit-test ability to inject an auth verifier; test valid fixture, missing token, malformed token, tampered signature, expired, wrong issuer, wrong audience, wrong subject, JWKS failure.

GO: 0 unauthorized access across every route, 100% negative cases denied, positive token passes with valid issuer/audience; no login regression. Abort rollout on any bypass.

## P0—02 Backup and recovery

1. Inventory D1 schema, migrations, current binding, previous Worker deployments, Access policy and owning project. **Read metadata only; do not pull real intimate content into GitHub.**
2. Create encrypted backup/export procedure for authorized private owner, with manifest/checksums and retention policy; don't assume temporary ZIP is a backup.
3. Restore to a *new isolated* D1 fixture/test instance, compare row counts/schema/checksums, then reject backup if inconsistent.
4. Confirm data erasure semantics: D1 delete, future exported ZIP, local Obsidian copies (cannot revoke downloaded files). Maintain a clear UI warning.
5. Recover Worker binary/config separately from data, and document one-click/command rollback to previous release.

GO: end-to-end restore test from consistent snapshot in isolated environment; no loss/mis-attribution; access still denied to unauthenticated browsers.

## P0—03 Release lineage and preview

1. Inspect the PR stack for conflicts, exact parent commits, changed files and CI. Build release candidate from the final intended state while preserving full history, ideally sequential integrations #7 → #8 → #10 → #11 → #12 with review at each step, subject to approval of existing PR content.
2. Encode Cloudflare Workers configuration in repository; align Worker name, custom domain route and D1 binding to explicit deployment environments. Don't put account secrets in code.
3. Production domain is stable; stage under protected, separate preview with its own D1 and no real personal data.
4. Add deploy pipeline: checks → build → integration test → version upload → human approval as required → deploy → smoke test → record commit SHA/version/time. GitHub is release source; direct ad hoc deploy is break-glass only.
5. Track drift by comparing current Worker deployment metadata with expected Git commit/release manifest. Drift = stop, don't blindly redeploy.
6. Add rollback drill using previous deployment and isolated test data.

GO: every live version maps to a commit and can be rolled back; 0 actions that expose private content via preview URL.

## P0—04 Storage and concurrency

Current state is one JSON document with optimistic 409 and at most 30 inbox notes. Before expanding:
1. Model daily_sessions / tasks / notes separately with stable IDs and transaction rules.
2. Do not silently truncate notes, delete previous days or move unfinished tasks.
3. Conflict UI for two tabs/devices: local draft preserved, server version displayed, merge options without data loss. Don't encourage full reload that discards edits.
4. Use idempotency keys for mutating operations, unique constraints, concurrency tests; version state explicitly.
5. Schema changes are **additive**, have dry-run migration + rollback plan and preserve V1 payload until parity validated. No big-bang destructive migration.

GO: two concurrent simulated sessions, two sets of edits preserved/merged intentionally; failure paths report an actionable error rather than showing "saved"; 0 accidental deletion.

## P0—05 Privacy boundary

1. Separate data classes PUBLIC / PRIVATE / SENSITIVE-OPT-IN / SECRET-BLOCKED.
2. Default to user selection for export; full export including sensitive/third-party notes requires explicit confirmation.
3. Never send P2 (health/faith/relationships/family finances) to remote LLM without explicit granular consent.
4. No secrets, content bodies or account identity in GitHub commits, telemetry, URL parameters or logs.
5. Review markdown import safety: raw content can contain instructions, headings and wikilinks. Render as quoted inert text or sanitize to avoid poisoning the curated wiki. Never treat raw prompt strings as AGENTS instructions.
6. Unit test "delete card" and verify no "ghost node" persists; clarify that downloaded copies remain independent of server erasure.

GO: zero leaked raw bodies in logs or public artifacts; every sensitive export is opt-in and acknowledged.

## Engineering PR plan

| PR | Contents | Depends on | Gate |
| --- | --- | --- | --- |
| P0-01 auth-core | Verified JWT middleware, tests, policy/csp headers | Release state audited | 100% token-negative matrix |
| P0-02 release | Cloudflare staging, reproducible build/deploy, SHA, rollback | P0-01 | private preview, rollback drill |
| P0-03 data | schema migration with no deletion and concurrency UX | P0-02 | 2-tab lossless test |
| P0-04 privacy | export selection, redaction, copy disclosure, source sanitization | P0-03 | no source leak |
| G1-shell | Official React/Vite Workers SPA + route parity | P0 | Android flow gates |
| G2-graph | typed source/evidence/nodes/edges and React Flow UI | G1-shell | 100% edge provenance |
| G3-llm-wiki | user-reviewed agent librarian with per-source diff | G2 | raw hashes stable |
| G4-adapters | one read-only source connector at a time | G3 | no stale-as-live |
| G5-jarvis | policy-gated action proposals with receipts | G4 | 0 irreversible automatic action |

## QA smoke sheet (Android + browser)

| Check | Expected outcome |
| --- | --- |
| Anonymous GET / | CF Access login; no Life OS private HTML |
| Anonymous GET /api/vault | denied; no ZIP |
| Forged JWT header | denied by Worker itself |
| Valid session + reload | same saved state and source versions |
| Two tabs edit | conflict review, no silent overwrite |
| Failing D1 | visible unsaved/offline state, copy available |
| Force Access expiry | save blocked, draft copy preserved |
| Private preview | isolated fake data, never prod note |
| Promote note to claim | source hash and status, explicit consent |
| Erase knowledge card | disappears from server/next ZIP, other raw copies disclosed |
| Open new ZIP in Obsidian | markdown links resolve, Unicode intact |
| LLM ingest fixture injection | raw treated as data, not executable prompt |
| Disabled JavaScript | graceful explicit unsupported state, no data leak |
| 360px viewport | controls tappable, scroll natural, no horizontal clipped fields |
| prefers-reduced-motion | no forced animation |

## Freeze conditions

STOP on any security bypass, mismatch between release SHA and binary, uncaught destructive migration, failed restore, privacy leak, invalid personal inference treated as verified fact, or action executed without an authorization gate.

## User-owned access and approvals needed later

No new credentials are requested during planning. Implementation may need approval for reading JWT app configuration, creating a private test environment, switching CI/CD deploy ownership, access to local vault on Omarchy, and provider OAuth connections. These are separate consent checkpoints, not broad blanket authorization.

**Bottom line:** before another capability becomes delightful, the foundation must be boringly trustworthy.
