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
