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
