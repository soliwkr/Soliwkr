# AIOS — G1 automatic GitHub evidence ledger

**Status:** implemented in source and test fixtures; **not in production**. Depends on single-owner Access JWT gate in PR #18 and unified existing cockpit PR #19.

## Purpose

One real, zero-input loop: public GitHub technical event → scheduled read-only collector → normalized D1 event + source reference → Mission Control recent-events line. No manual note, checkbox, webhook, API token, LLM speculation or invented success metric required. Source is GitHub public Events API, NOT inferred from GitHub last push or the AI chat transcript.

## Scope

- `src/observations.js` polls the ten project repos owned by the existing Worker `REPOS` list.
- Only source events with exact GitHub URLs are recorded: pushes with commit hash, PR, issue, release and branch creation. The raw event payload is discarded; PR author/content details are not stored.
- Ingestion is at most six events per repo per poll, globally unique by `(provider,event_id)`, and resilient to retries/replays.
- `source_checks` tracks checked_at, status ok/error and an error code. Provider outage never becomes "healthy" or "0 projects". Existing historical events are kept as historical, not falsely presented as fresh.
- `GET /api/observations` is protected by the same verified single-owner Access identity as all other private endpoints.
- The existing Oggi Mission Control renders the newest event URL + occurred_at if available; otherwise clearly marks source unverified.
- No Cloudflare API credential yet: the current collector is **GitHub public events only**. Cloudflare deployment history is a separate adapter and gate.

## Schedule and permissions

`wrangler.json` includes `0 * * * *` (hourly), not every minute. The source collector uses GitHub's publicly available Events API without owner OAuth. Rate limits / provider staleness can impact results; log only generic error codes, never secret-bearing response bodies. No user data are sent to GitHub by the collector. The current repo list is the authoritative source registry for this first public scope. Larger lists should use GitHub App credentials and cursor/etag state instead of treating public endpoint as unlimited.

## Additive D1 schema (NOT applied to production)

`migrations/0003_source_events.sql` creates `source_events` with idempotency unique key and `source_checks` for per-repo connector health. Zero changes to `private_state`, `knowledge_sources` or existing user notes. Run this migration only after backup/restore gate and isolated staging rehearsal.

## Readiness / risk gates

1. G0 PR #18, owner Access email confirmation, org issuer/aud and actual signed login smoke test (two access emails share one current D1 → one must be explicitly selected).
2. Reproducible production Worker release with exact Git SHA. Full D1 backup and restore rehearsal in isolated test database.
3. Apply schema in staged D1; CI `npm test`; manually invoke scheduled with synthetic GitHub payload (no OAuth) and verify dedup/status/report. Check 401 unauthenticated access to observation API.
4. Verify one real public GitHub event appears within maximum documented polling delay (expected up to 60 minutes plus API availability; this is **not** a hard external SLA).
5. Only then configure the same cron in production. Rollback cron/Worker possible, additive table retained until fully exported and safely retired.

## Not yet true

- No source event was ingested into live D1 during this PR.
- Jarvis has not received a proactive Telegram notification.
- No authenticated Cloudflare deployment-change collector yet.
- No Gmail/Calendar/Black Office economic adapters; business results cannot be inferred from these events.
- No Obsidian bidirectional sync: current ZIP exporter remains one-shot.

**First real WOW gate:** a source event arrives unprompted, appears in the existing cockpit with exact source+time, and later produces one gated Jarvis notification.
