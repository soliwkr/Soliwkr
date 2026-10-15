# SOLIWKR JARVIS — Telegram Agent Bootstrap

**Stage:** code/test ONLY — not live, no bot credentials, no deployment. This is a minimal **real Cloudflare Think Agent**, not a simulated JSON chatbot. Owner: SOLIWKR Operator AIOS. See [ADR-002](../../design/life-os-v2/ADR-002-JARVIS-RUNTIME.md) in the planning PR #13.

## Starter Gate / provenance

- Official starter adopted: [Cloudflare Agents Think Chat SDK Messenger](https://github.com/cloudflare/agents/tree/main/examples/think-chat-sdk).
- Reference upstream file: `examples/think-chat-sdk/src/index.ts` at commit `936d2cb6e97b15354f17d7a859afc8e896445ea0` (observed 2026-10-13).
- Runtime: `agents`, `@cloudflare/think`, `@chat-adapter/telegram`, Cloudflare Worker + Durable Object. The source uses the same `Think` subclass and official `telegramMessenger()` adapter.
- Differences from official demo: **removed publicly accessible /setup endpoint, web admin UI, and wildcard agent routes**; only health and verified Telegram webhook requests can reach the runtime.
- Hardening at entry: webhook shared secret and numeric sender/chat identity, direct private chats only, reject absent owner config, size/content-type/method checks. Telegram adapter then applies its own webhook verification.
- This is not yet a full secure **pairing** implementation. An authorized Life OS Access UI will eventually bind the owner's Telegram ID. Until then the owner ID is a private setting and the bot is unconfigured and closed.
- No other Life OS/private D1 APIs are bound. The bot **cannot read personal memories**, use tools, write GitHub or send proactive notifications yet.
- Hermes is a delegated specialist later, not an alternative persona or memory store.

## Development (after dependency install)

```sh
cd cloudflare/jarvis-agent
npm install
npm test
npm run typecheck
```

No token is needed to run unit tests. Do not deploy this starter until the G0 controls are complete.

## Secrets and provision *later* (NOT now)

Bot owner must create a Telegram bot using `@BotFather` and start a 1:1 conversation. Do **not** paste the bot token into ChatGPT, GitHub, config files, git commits, or issue comments.

Required runtime secret values stored in the Cloudflare account:
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_BOT_USERNAME`
- `TELEGRAM_WEBHOOK_SECRET_TOKEN` (separate high-entropy secret)
- `JARVIS_OWNER_TELEGRAM_ID` (numeric Telegram user id; eventual pairing mechanism removes the need to input this manually)

The Telegram webhook route is `/messengers/telegram/webhook`. There is intentionally NO public webhook-registration route. Register it from a controlled operator environment with an authenticated Telegram API call, after a dedicated HTTPS custom domain has been assigned and secret configured. Never expose the token in a URL logged by a shell or proxy.

## Mandatory pre-deploy gates

1. G0 Issue #14: verified Cloudflare Access JWT for all Life OS private API access, backup/restore drill, release lineage.
2. Release configuration: private custom domain for Jarvis webhook; `workers_dev=false`; no wildcard exposed agent RPC.
3. Sender gate: validate secret, private chat and owner identity. Unauthorized webhook inputs receive no model response.
4. Usage budget: set a capped Workers AI model quota, rate limits and a deterministic response fallback. The included model is from the upstream example, **not a provider/cost approval**.
5. G1 Issue #15: verified automatic source event before claiming a "zero input" proactive capability.
6. Integrate Access-session pairing via owner-specific, expiring one-use grant — DO NOT open first-user-wins registration.
7. Dry run with an actual bot from Android, one authentic verified event, dedup/quiet hours and graceful no-data behavior.

**Security warning:** Telegram bot chats are not Telegram Secret Chats (not E2EE). Do not send private family, faith, health, or detailed financial data into Telegram by default. After a chat leaves the protected Control Room, the downloaded/exported message cannot be revoked.

## Boundaries

This repository contains only code, configuration shape and tests. No production user content, tokens, Telegram user ID or bot chat history are stored in GitHub. The bot is scoped to **read-only** and **no data sources** until separately authorized; replying to a direct chat does not convey permission to execute commands or spend money.

Next PRs: (a) owner-verified Access pairing, (b) source-backed /stato, (c) single verified outbound notification with idempotency and quiet hours, (d) Hermes tool delegation with an explicit approval policy.
