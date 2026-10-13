# ADR-002 — SOLIWKR JARVIS: Cloudflare resident, Hermes remote/desktop as operations
**Status: APPROVED DIRECTION from user conversation, 2026-10-13 · Implementation gating remains in force.**
**Owner: Operator & Portfolio AIOS.** No production migration implied by this design decision.

## Decision: ONE AIOS, ONE COCKPIT, ONE JARVIS

**JARVIS = always-available Cloudflare Think / Agents SDK resident agent.** Cloudflare Durable Objects handle session state; D1 and each domain's canonical systems hold evidence, decisions and owned records. Telegram is the primary natural-language channel. **The existing Life OS cockpit at aios.soliwkr.pro remains the one human-facing dashboard**: no second dashboard, no new portfolio OS.

Hermes is a **delegated operational worker**, with two non-exclusive substrates:
- **Hermes on the existing VPS:** optional always-on or persistent heavier tool execution after evaluating actual service availability, cost, security and storage. The user has confirmed a VPS exists. The VPS is NOT a prerequisite for Jarvis to receive messages, perform read-only tasks or send proactive notifications.
- **Hermes on the laptop:** optional local branch when on, for filesystem, terminal, local Obsidian work and coding. Jarvis does not stop functioning when the laptop is off.

The previously shown Telegram **Soliwkr** bot is a real existing interface, but a screenshot is CONTEXT, not permission to change the architecture, replace the chosen resident Think agent or modify production. Do not assume that Telegram bot token, gateway and account identity can be reused without an explicit technical migration/pairing plan. Avoid two simultaneous webhook/polling consumers on one token.

## One home screen (not one endless page)

The existing `Oggi` view becomes a unified, source-backed **Mission Control** with condensed cards for real infrastructure, resident agent, VPS/desktop workers, knowledge, portfolio, next gate and Atlas. Other seven views remain drill-downs for detail or optional capture. No new cockpit and no forced manual data entry. A source not connected is UNKNOWN, never "0", "healthy" or fictitious revenue.

## Runtime diagram

```text
Authorized canonical source systems (GitHub / Cloudflare / owned business OS)
            |
   event collectors + policy + provenance       [Cloudflare Workers + D1]
            |
    SOLIWKR memory / graph / approvals           [D1 + verified source refs]
            |                      |
      MISSION CONTROL                      JARVIS THINK
      aios.soliwkr.pro                     Cloudflare DO resident
                                             |
                                    Telegram private DM
                                             |
                              Approved restricted tool calls
                                        |         |
                               VPS Hermes     laptop Hermes
                               optional       optional
```

**Critical invariant:** the agent's chat history is not the source of truth for decisions. Hermes jobs cannot bypass AIOS policy, budget, owner identity or human approval for irreversible actions. The V1 screenshot's claim of a backup or running process is not backup/restore proof.

## Architecture boundaries

1. Cloudflare Think route separate from Access-protected cockpit; webhook ingress verifies Telegram secret and bound owner ID. Agent private API calls require a distinct scoped service identity; they do not reuse a random Access token.
2. Cloudflare Access origin verifies RS256 JWT using the actual organization JWKS, issuer, audience and explicit **single owner**. The currently two-email allowlist does NOT grant a second owner access to one shared state.
3. Source collectors and graph do not depend on Telegram or Hermes uptime. Proactive events use idempotent receipts, rate budget and quiet hours.
4. VPS and laptop may both be online, but Hermes execution must have a single accountable dispatcher, scoped credentials, explicit command permission and task receipts. No shared uncontrolled token on multiple polling gateways.
5. Obsidian is a local curated knowledge projection, not a second untraceable master. No automatic access to local notes unless a secure sync/agent is explicitly granted.
6. No forced manual data entry; the chat is a convenient query/approval surface. Sensitive health/family/faith information is off by default for Telegram and LLM processing.

## Implementation priorities

G0 — Verified identity, backup/restore, release provenance on the existing Life OS (Issue #14, PR #18).
G0.5 — Unified source-backed **existing** cockpit, not a redesign as new app (PR #19).
G1 — Verified GitHub/Cloudflare collectors with evidence ledger, change times, dedup and one actual event without manual input (Issue #15).
G2 — Deploy and pair Think Telegram bot using official starter PR #17, with user-controlled bot provisioning, read-only tools, quotas and fail-closed webhook.
G3 — One source-backed proactive notification, with dedup and owner consent.
G4 — Connect Hermes VPS first where useful and laptop as optional operational executor; do not make either required.
G5 — Karpathy Wiki and evidence-based personal self model, with source traceability and correction/revocation.

## User control rule (permanent operating constraint)

**Observation is not authorization.** A screenshot, question or hypothetical is contextual data. Assistant can advance within the agreed scope but MUST ASK before changing the approved architecture, shifting the project owner, replacing tools, publishing, spending, manipulating Access principals or merging/deploying with unverified risk. Propose tradeoffs and wait for a decision on deviations. Scope-aligned reversible implementation/review/CI may proceed without asking every step.

## Acceptance

- The user can turn off the laptop: the Cloudflare-resident agent still responds and can read approved canonical sources; offline Hermes task is marked deferred.
- A source event is acquired and the user gets one source-backed alert without manual data entry.
- The single existing cockpit represents true component status, including unknowns and timestamps.
- Private data cannot be read by another Access-allowed email, unpaired Telegram actor or an unprivileged Hermes tool.
- No irreversible action without approved policy gate; no invented revenue, human well-being inference or untested backup claim.
