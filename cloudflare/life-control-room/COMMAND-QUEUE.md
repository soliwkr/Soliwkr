# SOLIWKR Command Queue — Gate G0 (PR #27)

## Existing system, not another app
This additive slice belongs to the existing authenticated `aios.soliwkr.pro` Worker and its private `LIFE_DB` D1. `Oggi` displays ONE human ACTIVE command before its existing rooms; no independent queue app, new provider, subscription, model invocation, or laptop runtime.

- New additive migration: `migrations/0006_command_queue.sql`. Apply to **staging D1** and test there first. Do not run production migration until the release owner approves backup/rollback procedure; G0-B2 off-account backup remains HOLD.
- Source code and test fixtures contain no real personal tasks. The D1 tables `command_tasks` and append-only `command_history` retain private task content/evidence.
- All routes remain behind existing verified owner-only Cloudflare Access. Writes additionally require same-origin `Origin`, `x-control-room: 1`, JSON content type, version checks and bounded request bodies.
- SQLite partial unique index enforces at most one human `ACTIVE` entry globally. Atomic D1 `batch` writes and audit inserts guard each transition. Another READY task cannot silently preempt an existing ACTIVE task.
- Intakes always begin `CAPTURED`. An owner-direction decision with rationale approves `READY`. The deterministic ranker promotes a READY human task by priority desc, created_at asc, id asc *only if* no human ACTIVE task exists. Completion requires an evidence string; BLOCKED/PARKED require a reason; both route on to the next eligible READY task.
- Current evidence is **owner reported**, not independently verified. No AI-based prioritization, agent dispatch, self-scheduling, inbound capture from all connectors, or automatic CEO judgment is claimed. No event from GitHub alone implies a real-life obligation.
- GET has no write side effects; refresh never creates duplicate tasks.

## API contract (owner-only)
- `GET /api/command-queue` — sole human ACTIVE command, aggregated counts and policy; returns 503 if migration is absent.
- `POST /api/command-queue` — creates CAPTURED task with `title,outcome,why_now,done_when,source_kind,source_url,source_status,assignee,privacy_class,priority,review_at`.
- `POST /api/command-queue/:id/ready` — `{version,reason,priority?}`; direction-approved promotion from CAPTURED/BLOCKED/PARKED.
- `POST /api/command-queue/:id/finish` — `{version,status:'DONE'|'BLOCKED'|'PARKED',evidence?,reason?}`.
- `POST /api/command-queue/next` — deterministic promotion when no human ACTIVE task; **not** agent dispatch.

All writes require `Origin` matching the Worker origin, `x-control-room: 1` and application/json, in addition to Access. Automation adapters must use a legitimately authorized channel: **never** bypass Access with a hardcoded secret or expose a public intake endpoint.

## Release checks
1. Run `npm test` (includes real in-memory SQLite migration/index tests and request-contract tests).
2. Migrate isolated staging D1, verify safe migration rollback strategy and GET returns honest empty state before ingestion.
3. In staging with synthetic tasks: CAPTURED remains idle; READY activates exactly one; DONE with evidence advances; BLOCKED with rationale advances; stale-version write 409; simultaneous claim WIP=1; unauthenticated/nonowner 401; wrong Origin 403.
4. Browser smoke on mobile, owner vs second allowed email, XSS-safe source rendering, existing seven rooms and status table unaffected.
5. Document staging results, release SHA, snapshot/recovery and rollback; request human production GO. **Do not deploy automatically.**

Success is not a mock UI with a green badge: production passes only when at least one genuine owner-approved task with defensible provenance survives refresh and progresses correctly with audit.
