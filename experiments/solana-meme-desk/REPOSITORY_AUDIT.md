# SOLIWKR Meme Desk — repository selection and Helius adapter

Research date: 2026-10-26. Scope: PAPER ONLY, no new runtime, no VPS changes, no production trades.

**Decision:** full bots are worthwhile if we accept a persistent runtime, but none of the reviewed candidates is a drop-in replacement for this Cloudflare Worker. Reuse source-level logic instead of operating another bot.

- Chainstack `chainstacklabs/pumpfun-bonkfun-bot` (Apache-2.0): strongest reusable PumpSwap account layouts, RPC rate limits and regression fixtures. Python 3.11+, WebSocket/Geyser listeners, live-wallet trading; upstream warns not production-ready.
- `pump-fun/pump-public-docs`: authoritative pool account offsets, negative signed i128 virtual quote reserves, and effective quote reserve formula.
- `raydium-io/raydium-sdk-V2` (GPL-3.0): official Raydium reference; licensing review needed before copying.
- `OnlyTerp/papertrench` (MIT): strong paper-fill provenance, independent re-pricing, missing-data semantics; primarily browser extension, not autonomous bot.
- `farfary/ScreenerBot` (BSL 1.1): rich on-chain pricing, paper mode; restricted commercial use and long-lived Rust service.
- `0xfnzero/solana-streamer` (MIT): high-speed Solana streaming, requires persistent gRPC/ShredStream source.
- `hummingbot/gateway` (Apache-2.0): useful future DEX execution middleware, needs its own server.

Implemented on branch `feature/solana-memecoin-desk-paper-20261026`:
- `pumpswap-pool.mjs`: read-only pool/vault/mint proof via Helius; exact pool base/quote mints, decimals, pool program ID, signed virtual reserves, native spot reserve ratio. No external npm dependencies.
- `pumpswap-pool.test.mjs`: nine deterministic fixture tests, with negative reserve, wrong mint/program/vault and unsupported quote.
- Research only: bounded one-off cron probes stored in D1 table `onchain_quote_probes`; endpoint `/api/onchain-proof` reads stored result. Original simulated-trading pipeline remains unchanged.

Official sample pool probe id=1 failed due manual sample-mint typo; id=2 corrected sample PASS via real Helius RPC. Actual spot was 0.00000018249568673 SOL/token at slot 461797569; virtual quote reserve was -125882 raw units, showing why raw vault balances alone are wrong.

**Incomplete:** no independent 1-hour swap volume, executable fill, slippage/fees validation, or SOL/USD conversion yet. No change to trade filters or P&L. Never use the adapter as a USD quote or permission to place orders without those proofs. Full paper reliability remains blocked while market data sources rate-limit.

## Second live benchmark (26 October, 20:26 UTC)

- Verified a **Scout-discovered PumpSwap pool**, `MtD7C3bpRPP2LNim3DUfnoVTuRSQHBuCWhu9fKYKJqh`, mint `8ypYfW5cjafrfAZij8TZj5SFHAbPNpiRio96LMzypDkn`.
- Helius mainnet slot `461798973`: spot `0.000000024710921618 SOL/token`, effective quote reserve `22114684439` raw, virtual reserve `17584436792` raw; program and vault mint checks passed.
- Base mint is **Token-2022**, quote mint is classic SPL WSOL. Program owner matching passed. Extension features and transfer fee/scale are not audited: status `TOKEN_2022_EXTENSIONS_UNAUDITED_NOT_EXECUTABLE`.
- Code remains read-only. No input to the existing trading engine was changed. Important remaining gaps: independent 1h swap volume, quote currency USD conversion, pool-specific fee/slippage model, and Token-2022 extensions.
- Initial sample mint transcription error and first strict Token-2022 rejection remain preserved as FAIL records alongside corrected PASS records in the D1 probe table.

## On-chain market quality pilot (26 October 2026)
- Added `pumpswap-volume.mjs` + fixtures: bounded historical swap-volume attempt via Solana `getSignaturesForAddress` and `getTransaction`, checking buy/sell logs, same-pool vault balances and signs, explicit 60m completeness and a 6-transaction RPC credit budget.
- Volume represents approximate *quote-vault turnover*, not proof of swap payment after token transfer fees. `usableForHardVolumeGate=false` even for fully scanned snapshots; no threshold is silently relaxed.
- Added `pumpswap-quality.mjs`: Helius WSOL/USD indicative quote (public CoinGecko fallback), live PumpSwap global fee minimum (LP + protocol only), and conservative Token-2022 mint extension inventory. No exit or entry gate changes.
- 2026-10-26 20:36:23 UTC, probe 1: live on-chain pool spot ~0.000000024710921618 SOL/token; Helius WSOL/USD 100.15776; implied *indicative* USD spot 0.0000024749905567944556; LP 20bps + protocol 5bps. Token-2022 mint extensions were metadataPointer and tokenMetadata, not transferFeeConfig; executable fill still unverified.
- Probe 1 historical RPC failed with `HELIUS_RPC_ERROR_-32015`: a Solana transaction v1 reached a request using `maxSupportedTransactionVersion:0`. Fixed request to support version 1 and scheduled a separate immutable probe 2. Solana transaction v1 live since September 15, 2026.
- Requires independent provider comparison and full-hour trade indexing before using any volume for $40k/h hard gate. Higher-activity pools will exceed the small bounded RPC budget and must remain unverified; efficient solution likely event indexer/streamer, subject to budget and user permission.
- All work is paper-only. Existing cloud Worker continues 1-min cron, $1000 fictitious book, with no wallet and zero live trading.

## Verified first on-chain hour-window retrieval (26 October 20:38 UTC)
- Root cause of `-32015`: `getTransaction` used `maxSupportedTransactionVersion:0`; Solana mainnet transaction v1 requires `1`. This was corrected and confirmed on Helius.
- Probe 2 at 20:38:23 UTC: 2 historical transaction signatures in the 60-minute window, 1 PumpSwap buy/sell-like vault movement, `0.021701475 SOL` quote-vault turnover. This is only a **vault-delta approximation**, not an exact trade-volume certification or USD history.
- On-chain fee configuration: LP 20 bps and protocol 5 bps; dynamic creator fees remain unverified. WSOL/USD via Helius DAS 100.15268 at observation; it is not a historical FX series.
- The official PumpSwap IDL exposes BuyEvent / SellEvent quote amounts and fee fields, with Anchor event discriminators `[103,244,82,31,44,245,119,119]` and `[62,47,55,10,165,3,220,42]`. New parser extracts quote amounts and checks the source pool; probe 3 records its one-off validation without permitting trades.
- A full-hour volume threshold for trading requires complete historical coverage and a defensible USD conversion; the bounded probe intentionally cannot validate busy pools needing >6 individual transaction reads. Do not enable the $40k/h gate from the probe's estimates.

## Verified PumpSwap event amount and fee fields (20:46 UTC)
- One-shot probe id 3 and id 4 completed on the same Scout-discovered Pool `MtD7C3bpRPP2LNim3DUfnoVTuRSQHBuCWhu9fKYKJqh`.
- Signature `48FMUk5RumucnhuPsqSWyPDUwwmQbbYaVAjY2geWNaiFGebWYscRbDj98b8fq24fyNbgeUjX8HrFHWTJ75Wm4QZu` at slot 461792420 emits an official PumpSwap SellEvent.
- Authoritative event quote amount: **21,873,181 raw WSOL units (0.021873181 SOL)**, versus quote-vault difference 0.021701475 SOL. This difference demonstrates why reserve deltas are not exact traded notional.
- The exact event reports **LP 2bps/4375 raw, protocol 93bps/203421 raw, creator 30bps/65620 raw**. Live dynamic trade-specific fees differ materially from GlobalConfig's base 20bps/5bps settings. Never hardcode the latter as an executable quote.
- Two transactions in the last hour on this pool; one was a matching trade event. Exact *native quote token* amount from this small complete window is now verified as `verifiedNative=true`. Volume in historical USD is still **not verified**, so `usableForHardVolumeGate=false` remains enforced.
- The audit proof stores the signed transaction, slot, event fee components and Helius FX observation; no paper cash or orders changed. Do not treat this one quiet pool as evidence that the implementation scales to a $40k/h market.
