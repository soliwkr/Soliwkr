# SOL-35 — isolated draft overlay, not installed

Base: paperclipai/paperclip@8f1cb11a034b82e93fa414f8e77beeb702cc14e8.
Owner of server code: Paperclip upstream/deployment owner. Soliwkr holds this explicitly requested delivery patch only, not a server fork or business datastore.

In an isolated checkout with dependencies already available (no production container):

```sh
python3 /path/to/overlay/verify.py /path/to/isolated/paperclip
cd /path/to/isolated/paperclip
git apply /path/to/overlay/menu.patch
OPENAI_BASE_URL=http://127.0.0.1:9 pnpm --dir server exec vitest run src/__tests__/telegram-ceo-menu.test.ts
OPENAI_BASE_URL=http://127.0.0.1:9 pnpm --dir server exec vitest run src/__tests__/chat-channels.integration.test.ts -t 'keeps Telegram menu/start|keeps successive Telegram DM|compact single-use Telegram'
pnpm --dir server exec tsc --noEmit
```

Do not point these commands at the running /app. No dependency/provider changes, bot commands registration, migrations or live messages are included. Do not merge/deploy/restart from these instructions.

MVP: eight sections, paged project/task metadata, back/refresh, private linked-human navigation through existing authorization/ingress. `/start` and `/menu` are control inputs; free messages retain native task/chat handling. Scope-signed callbacks expire after ten minutes; process restart invalidates old keyboards. Reusing a valid button may refresh the view; navigation has no business mutation. Durable ingress deduplicates the same provider callback ID. No callback grants approval.

NOT IMPLEMENTED: owner portfolio verdict filters; BLACK OFFICE experiments; proof-backed economics; approved ONE NEXT ranking; proactive event notifications/quiet hours; task proof drilldown/approval bridge. Decisions lists pending Paperclip approval metadata only. Agents lists state only (task association missing). Alerts lists blocked open task metadata only. No evidence-backed claim of full product acceptance or Android verification.

Remaining production installation blocker: current owner build checkout/Compose context, overlays and deployed image digest have not been observed; remote authorized access is unavailable in this run. An operator can run the following read-only inspection on the declared VPS (no .env read):

```sh
cd /home/soliwkr/soliwkr-orchestrator/paperclip
git rev-parse HEAD
git status --short
docker inspect --format '{{.Config.Image}} {{.Image}} {{index .Config.Labels "com.docker.compose.project.config_files"}} {{index .Config.Labels "com.docker.compose.project.working_dir"}}' $(docker ps -q --filter label=com.docker.compose.project=soliwkr-orchestrator)
```

This prints image references/IDs and Compose paths only; it does not prove build context contents. Owner must then inspect only non-secret image/build/overlay declarations in those files (never dump environment/config). Installation remains subject to Staff, independent QA, isolated staging/runtime proof, Release readiness and explicit owner consent naming action/environment/scope. PR #29 / issue #27 gates unchanged.

Rollback proposal, NOT RUN: revert overlay in the isolated build; production rollback requires separately approved prior digest and Release execution. No measured rollback-in-minutes claim.
