# SOLIWKR Solana Desk — paper acceptance & Hummingbot evaluation
Date: 2026-10-26. **Paper-only, no wallet or on-chain order path.** `main`, VPS and other SOLIWKR projects remain untouched.

## Decision: Hummingbot Gateway
Upstream: https://github.com/hummingbot/gateway and https://hummingbot.org/gateway/connectors/
Gateway is a standalone TypeScript middleware service. The active published connectors list includes Raydium AMM/CLMM and Jupiter router on Solana, but does **not** list PumpSwap. Therefore it is **not a plug-and-play replacement** for discovery, holder analysis, liquidity lock verification, or stop-loss on a fresh PumpSwap listing. **Do not install on VPS** for the current 1-Worker paper pilot. Reconsider only if a live-execution phase is separately approved and a PumpSwap-capable connector and deployment capacity are verified.

## Operational boundaries
- Hosted Worker: `soliwkr-meme-desk-paper` (Cloudflare), D1 `soliwkr-solana-meme-paper` (EU).
- Deployment credentials are Cloudflare secrets; never commit API keys or a wallet.
- Last verified production state prior to this update: paused=1, cron schedules empty, one virtual Ginnan position with $100 initial cost, last mark from 2026-10-26 15:56:20Z. Its current value is **not verified**.
- Free API discovery via GeckoTerminal is rate-limited (429) in prior logs. DexScreener backup is promoted/profiled tokens only and not an exhaustive list of new pairs. Helius RPC solves blockchain access, not complete fresh pair discovery.
- Risk quote sources: DexScreener exact pool, GeckoTerminal exact pool, Helius DAS indicative USD token price if available, Jupiter indicative USD token price. **Indicative prices are not executable swap quotes.**
- Any missing evidence -> DATA_ERROR, never a filter PASS. Reject mint/freeze authority, LP proof, concentration, volume when evidence actually fails.
- Existing positions cannot receive guaranteed −8% stop fills: cron polls rather than ticking; gaps, liquidity, slippage and rate limits can cause worse losses.

## Safety gates before full overnight paper restart
1. Worker key present, Helius `getSlot` probe passes.
2. At least 3 consecutive discovery cycles with verified pool data and no API exhaustion.
3. Pool-specific liquidity-lock proof, supply concentration, token authority and volume checks validated against independent evidence.
4. Successful fresh quote retrieval (age and source logged) and at least one real-data paper open/close. Do not fabricate live trades to mark gates passed.
5. Deterministic fixture proof: no entry with failed gate; max 10% equity entry; stop trigger −8%; trailing activated at +15%; stale/unavailable prices block entries and valuation.
6. Audit the actual broker/DEX swap quote and liquidity impact before even considering real-money mode.
7. Run review over 12h+ and a valid morning report. Final decision requires a separate user confirmation.

## Current automated tests
`GET /api/selftest` executes 8 read-only deterministic safety fixtures (stop, trail, invalid price, filter boundaries). Additional in-memory tests executed through ChatGPT tools on 2026-10-26: synthetic BUY $100, −9% mark -> SELL stop, +20% then +10% -> SELL trailing, and unavailable quote -> no SELL; all passed. These tests do **not** claim live provider reliability.

## Current mode
**Scanner paused** pending provider health. A risk-only cron trial, if enabled, must keep `state.paused=1` and be monitored for source errors before restoring scans.

## Sources
- https://hummingbot.org/gateway/connectors/
- https://github.com/hummingbot/gateway
- https://docs.dexscreener.com/api/reference
- https://developers.jup.ag/docs/price
- https://www.helius.dev/solana-token-apis

## Scout collector revision (26 October 2026)
- New `scout_sources` D1 table records per-provider timestamps, success/error counts, cooldown and last candidate count. HTTP 429 cools down the affected provider for 30 minutes; other source errors for 5 minutes.
- Sources sampled: Raydium v3 standard pools ordered by 24h APR (not creation date!), GeckoTerminal recent-pools page one, and DexScreener promoted/profiled tokens if coverage is sparse. **All are incomplete discovery samples.** Raydium v3 pool opening time is checked per row; do not assume APR ordering means freshness.
- The diagnostic cron `*/5 * * * *` runs the Scout only while `state.paused=1` (and risk-checks existing positions). No automated new BUY is enabled.
- `/api/state` and `/api/recap` include upstream provider status/cooldowns, with `scoutCoverage=NON_EXHAUSTIVE_SAMPLES`.
- Parser fixtures, mandatory-risk fixtures and 429/cooldown tests passed. **Live source availability and repeated successful cron scans are not yet verified.**
- Next gate: 3 successive cron diagnostic runs with valid source response, measured pool counts, no 429 source failures, and no unverified data treated as filter pass.
- For truly event-driven fresh PumpSwap/Raydium pool creation, evaluate Helius enhanced CREATE_POOL webhook with strict address/source filters, signed/authenticated receiver, idempotency, event-credit budget cap and rollback before enabling it. No webhook has been created in this revision.
