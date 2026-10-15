# Soliwkr · LIFE CONTROL ROOM v0

## Scope / ownership
One-screen private cockpit for Chris across life areas and portfolio. This is a **projection**, not an owner of project-specific economic, CRM or transactional facts. The Soliwkr office remains canonical for governance and routing; BLACK OFFICE owns economics; repos own their work.

## Starter gate (2026-10-11)
- Use case: private mobile-first CRUD cockpit, six life areas, single daily focus, 3 goals, inbox, 10 GitHub repository activity signals.
- Official candidates examined: [cloudflare/templates/saas-admin-template](https://github.com/cloudflare/templates/tree/main/saas-admin-template) (Astro + D1) and [cloudflare/templates/d1-template](https://github.com/cloudflare/templates/tree/main/d1-template).
- **Chosen reference:** official `d1-template` (Workers + D1 storage pattern). Custom lightweight plain-HTML view used instead of cloning the full Astro admin scaffold, because this is deliberately one page, no login framework and no client build step. It remains compatible with plain official Workers/D1 APIs. No copy of framework code.
- Repo state observed live 2026-10-11; version lock: template main as retrieved that day. Upgrade path to Astro/UI framework only if this surface exceeds one page.
- Planned extension: server-side auth claims validation, source adapters for Calendar/Drive, GitHub App auth for private repos; audited Self Model remains separate and requires consent.

## Security
- Production custom domain `aios.soliwkr.pro`, protected by Cloudflare Access app `SOLIWKR — Private Life Control Room`.
- Access allowlist reused from existing private BLACK OFFICE application (the policy *rules*, not tokens).
- `workers_dev=false`, `preview_urls=false`; Worker also rejects any other hostname and missing Access assertion.
- D1 jurisdiction **EU**; private content stored in D1 only. No personal diary, health, family, finance, tokens or secrets committed to public GitHub.
- All HTML/CSS/JS self-hosted. No tracking, third-party script or font. No sensitive API data in CDN or public cache.
- This is **not** a clinically validated self-assessment. Colored signals are user-entered, without automated interpretation.
- Before adding third-party integrations: implement claim verification / server-side role authorization and least-privilege secrets. Do not assume public Workers routes protect themselves.

## Data model
```sql
CREATE TABLE IF NOT EXISTS private_state (
  id TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS change_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```
One JSON document per owner (single user V0), optimistic version check, shallow audit of update event time (no personal payload in audit). Max 16 KB PUT payload.

## API contracts
- GET /api/state — D1 state + version + updated time
- PUT /api/state — same-origin, Access session, JSON, custom header, optimistic concurrency; never calls other domains
- GET /api/projects — public GitHub last-pushed metadata, best effort; absence labeled unknown. Not revenue, progress or delivery KPIs.
- GET /api/health — requires Access as all other routes.

## Deploy
```
cd cloudflare/life-control-room
npx wrangler deploy
```
Wrangler config intentionally disables workers.dev routes. Private Access application must exist **before** attaching production domain. No production business metrics are estimated.

## Acceptance tests
1. Logged-out visit to `aios.soliwkr.pro` redirects to Cloudflare Access, never displays private state.
2. Authorized session renders HTML and GET /api/state succeeds.
3. Save focus; refresh; persists. New goal, checked completion, inbox note, pillar signal and 'not doing' persist.
4. Repository count is labeled GitHub activity; errors show unknown, never OK.
5. Unauthorized host/worker.dev path not reachable; mutations reject other origins.
6. Mobile narrow width is single column; no horizontal card overflow.
7. No email addresses/secret values/public profile data in repo or network logs.
