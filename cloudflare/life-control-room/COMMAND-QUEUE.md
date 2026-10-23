# SOLIWKR Command Queue — Gate G0 (PR #27)

## Existing system, not another app
This additive slice belongs to the existing authenticated `aios.soliwkr.pro` Worker and its private `LIFE_DB` D1. `Oggi` displays ONE human ACTIVE command before its existing rooms; no independent queue app, new provider, subscription, model invocation, or laptop runtime.

- New additive migrations: `migrations/0007_command_priority_audit.sql` follows `migrations/0006_command_queue.sql`. Apply to **staging D1** and test there first. Do not run production migration until the release owner approves backup/rollback procedure; G0-B2 off-account backup remains HOLD.
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

## Priority decision provenance
Capture retains initial priority (previous priority NULL). Each new transition records previous/resulting priority and resulting task version; history `id` equals the transition UUID. READY snapshots the eligible old row before its guarded update, inside one atomic D1 batch; stale decisions create no event. Promotion and finish retain unchanged rank. Migration 0007 leaves older events NULL because their original priorities cannot be reconstructed. Apply both migrations before this Worker version; test upgrade and rollback in an approved staging rehearsal. No live migration is authorized by this PR.

## Intake replay receipts (SOL-40 draft, no release authorization)
Migration `0008_command_intake_receipts.sql` follows 0007. It is additive, creates only technical key-to-task receipts, and performs no legacy backfill or deduplication. This draft does not authorize applying it to staging or live D1. With the new Worker and missing receipt table, intake fails closed with sanitized 503.

A nonempty source URL plus all validated, normalized intake fields identifies one capture (SHA-256 over a fixed ordered array). Whitespace trimmed by validation and omitted defaults normalize identically. Identical retries return HTTP 200 with the existing ID and current status; first capture returns 201. Task, receipt and CAPTURED audit commit in one atomic batch, including concurrent retries. Replay never resets state or appends history. The URL alone is not an event key: changed payload, executor or source kind creates a distinct capture. Manual captures with empty URL remain distinct. This is bounded payload replay protection, not a bridge event/version contract or a conflict policy for changed source events.

Rollout remains HOLD. In a separately approved rehearsal, apply 0008 to a disposable database upgraded through 0006/0007, then check first POST/replay/concurrent replay, audit failure rollback and existing rows. Existing duplicate records are preserved and require a separate owner decision. Rollback the Worker to its prior version while preserving the additive receipt table; do not drop receipts or delete tasks during rollback. A future return to this version retains receipts created by this version, but captures made by an older Worker during rollback are not backfilled.
