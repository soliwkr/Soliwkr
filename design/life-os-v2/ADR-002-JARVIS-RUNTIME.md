# ADR-002 — JARVIS: reuse existing Hermes Telegram, no second bot
**Status:** Revised on 2026-10-13 — **CONDITIONAL ON RUNTIME AUDIT; NO DEPLOYMENT AUTHORIZED**.
**Owner:** SOLIWKR Operator & Portfolio AIOS.
**Supersedes:** ADR-002 draft that selected Cloudflare Think as the primary chat agent before discovering existing bot.

## Evidence that changes the architecture

The owner supplied a screenshot of a **Telegram bot titled Soliwkr**, already interacting with a Hermes-like agent. The bot claims that on Linux it is installed under `/home/soliwkr/.local/bin/hermes`, with sessions/config in `/home/soliwkr/.hermes`, and projects at `/home/soliwkr/Work`.

**Important:** a chat reply is a claim, not a runtime attestation. It does NOT verify the systemd gateway, precise host or running instances, uptime, actual backup integrity, source permissions, whether Telegram token is duplicated across laptop/VPS, or that the bot has access to any SOLIWKR canon data. A backup status without restore test is not proof of recoverability.

An existing chat transport and an existing agent are now likely. Creating a second Telegram Jarvis and moving memory to Think by default is architectural waste and operational risk.

## Revised decision

**Reuse the existing Soliwkr Telegram bot and Hermes gateway as the FIRST Jarvis candidate. Do not deploy the separate Think bot.**

- **Soliwkr / Hermes:** user-facing Telegram chat, agentic tools and scoped specialist work. One live gateway owner per Telegram bot token.
- **Cloudflare / SOLIWKR Life OS:** central evidence ledger, source acquisition, source-aware graph, governance, personal data and durable decisions. Neither bot transcript nor Hermes local notes become normative source-of-truth simply by existing.
- **Obsidian:** curated local wiki fed by approved source-backed exports/sync; no manual entries required in the target operating model.
- **Hermes ↔ Life OS:** minimum-scope API/tools, initially read-only; service identity and policy enforced server-side, clear receipts, no unscoped terminal or writes to personal DB.
- **Cloudflare Think:** a **fallback**, only if Hermes cannot meet 24/7 uptime, security, latency or verified cost gates. Keep existing PR #17 as experimental/draft; never create competing gateway/Telegram token consumers without explicit migration plan.
- **Grok Bot:** not necessary for the first production loop.

### Why

The user already has a working Telegram conversation (as visible in the screenshot). Hermes includes a messaging gateway, memory and cron, so duplicating them with Think provides little immediate value. Cloudflare still gives us the hard part we actually need: reliable source ingestion and policy-governed memory. The cheapest deployment is reusing infrastructure already active; the highest-confidence choice requires verifying if that host is always available.

## Gate H0 — Verify actual Hermes residency (READ-ONLY)

On the Linux machine claimed in screenshot, run as the bot's Linux user:

```sh
command -v hermes
hermes gateway status
systemctl --user status hermes-gateway --no-pager
systemctl --user is-enabled hermes-gateway
hostnamectl --static
uptime
```

Also inspect any system-scope service and other Hermes gateways on the existing VPS, **without stopping them**. Never paste the contents of `~/.hermes/.env`, Telegram bot token, credentials or private logs in a public issue. Redact IDs and hostnames if needed. Confirm what machine responds when the laptop is off and whether Telegram message polling/webhooks conflict across hosts.

Check the backup separately: a claimed 8.1GB copy and permissions 700 are not a passed restore. Confirm source, date, checksum, encryption and restoration on disposable data. Do not read any private file into GitHub.

**GATE:** one confirmed responding gateway process + known durable state directory + recovery documentation. If host is laptop-only, choose existing always-on host or supported serverless arrangement after uptime/cost check. Do not infer a VPS is running the same token.

## Gate H1 — One real zero-input event

Source collectors observe GitHub / Cloudflare technical change with source, timestamp and deduplicated event ID. Life OS decides whether it merits attention. Existing Hermes gateway receives a tiny signed or authenticated **event reference**, retrieves an authorized read-only projection and sends one Telegram DM with citation. No need for operator to message the bot or write a note. Replays create zero additional DMs. Silence on no changes.

Do not treat Claude/ChatGPT connector tokens as available to Hermes or Cloudflare by default. Add integrations through explicit authorization.

## Security critical path

Issue #14: JWT verification, owner identity, storage backup and Worker release reconciliation before granting Hermes access to private Life OS APIs. Agent execution scope is disjoint from read tools; user approval required for irreversible operations. Bots are not E2EE chat recipients. Sensitive personal/third-party content should remain in Access-protected UI unless specifically authorized.

Keep GitHub PR #17 **draft and on hold**, not merged, until an evidence-based comparison proves Hermes insufficient. No new Telegram bot, no new paid model, no Cloudflare Container or VPS subscription required for this decision.

## Proof of success

1. Existing Soliwkr Telegram DM is confirmed to be served by one known Hermes gateway.
2. Local paths and host shown by bot are corroborated by shell, not by the model reply.
3. Without manual data entry, one actual GitHub/Cloudflare event appears in the Life OS ledger and generates exactly one Telegram alert with original link and time.
4. No private-data leak, duplicate messages, automatic spends or unauthorized agent writes.

## Relevant official docs

- Hermes gateway service management: https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/messaging/index.md
- Hermes Telegram channel: https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/messaging/telegram.md
- Cloudflare Think alternative: https://developers.cloudflare.com/agents/harnesses/think/
