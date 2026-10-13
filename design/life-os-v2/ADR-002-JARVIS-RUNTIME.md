# ADR-002 — JARVIS runtime choice: Cloudflare Think primary, Hermes delegated
**Status:** Accepted product/architecture direction for planning (2026-10-13); **not deployed**.
**Owner:** SOLIWKR Operator & Portfolio AIOS. Supersedes the unresolved Hermes-vs-Think-vs-GrokBot option set in the V2 design. No provider, OAuth, secret, billing or user data permissions are implied by this ADR.

## Decision

**JARVIS resident agent = Cloudflare Think + Agents SDK + official Telegram messenger adapter.**

- One resident agent persona, one Telegram DM, one Life OS authority graph.
- Worker/DO per user or bot with persisted conversation state and typed tools; model provider behind explicit, cost-controlled adapter.
- Durable event collection and evidence ledger in Cloudflare, **not** in Jarvis' conversation history.
- Messenger ingress deployed separately from the Access-protected private cockpit, via HTTPS route + Telegram secret-token verification + pairing to the owner.
- Business facts and cross-project decisions remain in their owners' data stores / GitHub; Life OS stores pointers, projections and authorized personal memory.
- Scheduler/webhooks produce *verified observations* before Think summarizes them. Do not wake expensive models on unchanged data. Proactive delivery requires a persistent channel binding, recipient consent, quiet hours, dedup and sender authorization.

**Hermes Agent remains a replaceable specialist execution runtime**, for jobs needing a Linux filesystem, terminal, browser, complex code changes, or long sessions. It is not another Jarvis identity and cannot silently replicate the private Life OS store. Where Hermes is available on the existing laptop/VPS, delegate restricted jobs over an authenticated tool/queue, beginning in read-only/draft mode. No reason to deploy an extra Cloudflare Container or buy a new VPS solely for Jarvis V0.

**Grok Bot is not the memory authority or primary messaging gateway.** Potential external executor only after evaluating provider data retention, export, tool scope and costs; no commitment.

## Why this decision fits the user's actual constraints

1. **Zero mandatory data entry.** GitHub/Cloudflare collectors populate event ledger without forms; message bot answers and occasionally surfaces actionable changes. Telegram chat is a *lens*, not the source.
2. **Cloudflare-first, not Cloudflare-for-everything.** Durable Objects persist Think conversation state, D1 persists sources/knowledge, Workers run webhooks and verified tools. The agent can idle between events and does not require a 24h Python gateway.
3. **Preserves existing Hermes investment.** User already has Hermes on laptop and VPS. Use it only where it adds a real tool, not to duplicate messaging state, app auth and event orchestration.
4. **No homemade agent loop.** Official Think provides chat lifecycle, message persistence, tool calls, resumable streaming and Telegram messenger support. Start from vendor official example; pin ref at implementation time and verify maintenance/license.
5. **Recoverable and inspectable.** App agent state != canonical decision log; every tool call requires source references, policy and receipts.

## Alternative matrix — explicit trade-offs

| Alternative | Strength | Main cost/risk now | Disposition |
| --- | --- | --- | --- |
| Think + Telegram | Native Workers/DO, event-driven, official messenger SDK | Some Life OS tools/adapters to implement; AI usage costs | **Selected** |
| Hermes on existing VPS | High built-in capabilities, fastest hands-on assistant | Persistent host costs/ops, external source API/auth wiring, risk of two competing memories | **Delegated/benchmarked** |
| Hermes in CF Containers | Python/Linux, Cloudflare account | Container wake/sleep, durable external storage, porting/supervision, compute billing | **Not first release** |
| Grok Bot hosted | Quick rich automation in provider sandbox | Provider lock-in, policies and data ownership | **Only optional trial** |

Cloudflare Containers may be cost-effective for bursty tool workloads and support sleeping; this does NOT establish that the Hermes gateway as a whole can run safely/economically there without state and ingress design.

## Component contracts

```text
Provider events (GitHub/CF + later opt-ins)
  -> source collectors (verified signed hook / scoped API polling)
  -> D1 event ledger + normalized source citations
  -> deterministic relevance policy
  -> proposal/brief queue (dedup + recency + quiet hours)
  -> JARVIS Think Agent -> Telegram DM (source link/time, sparse)
                           -> on-demand Life OS read-only tools
                           -> optional Hermes specialist, isolated, only approved task
Life OS D1/Obsidian remains the personal knowledge authority; no transcripts auto-mirrored.
```

Tool modes: `READ_SOURCE` (default), `PROPOSE` (review), `EXECUTE` (policy + role + approval + receipt). No permission can be granted by a natural-language claim in a Telegram message or a fetched document.

In agent responses distinguish source data, hypothesis, unknown/stale and consent. A GitHub push proves a push, not revenue or human wellbeing.

## V0 scope, strict order

**G0 — P0 identity/recovery/release (#14):** verify Cloudflare Access JWT server-side for cockpit and private APIs; restore rehearsal, least privilege, traceable Worker release. Until G0 complete, bot cannot read private D1 or deliver private content.

**G1 — Data collector (#15):** one read-only verified GitHub or Cloudflare change, deduped D1 receipt with source/occurred_at/observed_at, no private manual entries. Run without Think model if event has no material change.

**G2 — Telegram agent (#16):** deploy official Think Telegram example on a separate route with webhook secret validation, TTL one-time pairing via verified cockpit, bot only works in owner 1:1 DM. Slash fallback `/stato` reads approved projections with timestamps. Stale/unavailable = UNKNOWN.

**G3 — Proactive event:** on new CI failing / verified source drift, send *one* DM with original URL, timestamp, and "Apri" / "Non ora" actions. Zero repeated DM for replayed events; optional daily brief.

**G4 — Hermes specialist:** time-boxed compare on one repo reading/synthesis draft or automated tests, only if Think tools aren't adequate; documented extra latency/cost/permissions. No ambient access to family/health/faith data.

## Test gates (hard fail)

- Invalid Telegram webhook secret: 100% rejects; unpaired user and group: 100% denies access to personal tools.
- Unknown or invalid Cloudflare Access JWT: 100% deny, even if forged header present.
- Replay same event >=30 times: one ledger observation, max one Telegram alert.
- User sends `/stato`: answer has source and last verified time, or explicitly not connected; no fabricated data.
- No provider data: zero fabricated events, no "all clear" if provider couldn't be checked.
- No irreversible write/spend/publish from chat without protected UI approval and receipt.
- All P2 intimate content off by default for messenger and remote LLM; bot messages are not E2EE.
- Costs visible: chosen provider, request budget, hard limit with "paused" semantics.
- Rollback version/DO state/data independent.

## Source references verified 2026-10-13

- Cloudflare Think (agent loop, DO memory): https://developers.cloudflare.com/agents/harnesses/think/
- Cloudflare Think Telegram (signed webhook): https://github.com/cloudflare/agents/blob/main/docs/think/messengers.md
- Cloudflare official Chat SDK messenger starter: https://github.com/cloudflare/agents/tree/main/examples/chat-sdk-messenger
- Hermes official isolated profiles: https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/profiles.md
- Hermes CF plugin is community and scopes only tool execution, not the gateway: https://github.com/NousResearch/hermes-agent/blob/main/plugin-catalog/cloudflare-sandbox.yaml
- Cloudflare Containers consumption-based billing: https://developers.cloudflare.com/containers/platform/pricing/
