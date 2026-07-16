# Connections

Registry of every system your AIOS can reach. Filled by `/onboard` from Q4-Q7 answers; expanded over time as you wire new tools. `/audit` checks this file for domain coverage and freshness.

| # | Domain | Tool | Mechanism | Auth | Last checked |
|---|---|---|---|---|---|
| 1 | Revenue / Financials | Stripe (via Climbo) + Fatture in Cloud (SDI, da collegare) | Stripe: `mcp` (richiede auth); Fatture in Cloud: not yet connected | — | 2026-07-16 |
| 2 | Customer interactions | WhatsApp + di persona (vendita) · Climbo `os.trovatemi.it` (pannello cliente) | not yet connected | — | — |
| 3 | Calendar | Google Calendar (workspace trovatemi.it) | `mcp` + `script` (SA aios-workspace, scope calendar) | google | 2026-07-16 |
| 4 | Communication | Gmail `info@trovatemi.it` | Gmail: `mcp` + `script` (SA, gmail.modify/send) | google | 2026-07-16 |
| 5 | Project / task tracking | Google Sheet "Database Operativo" (15 registri) · foglio pipeline 7 colonne | `script` (SA aios-workspace, scope spreadsheets) | google | 2026-07-16 |
| 6 | Meeting intelligence | Drive `06_MEETING_INTELLIGENCE` (call fondatori registrate + trascritte = le procedure) | `mcp` + `script` (SA, scope drive) | google | 2026-07-16 |
| 7 | Knowledge / files | Google Drive + Docs (workspace trovatemi.it) · GitHub `soliwkr` + `StudioPuraLuce` · Obsidian (corpus liturgico) | Google: `mcp` + `script` (SA, docs/drive); GitHub: `script` (gh CLI) | google | 2026-07-16 |

**Mechanism options:** `mcp` (MCP server), `script` (Python/Bash hitting an API, in `scripts/`), `export` (CSV/JSON dump pipeline), `key+ref` (`.env` key + `references/{tool}-api.md` guide), `not yet connected`.

When you wire a new tool, also save `references/{tool}-api.md` capturing endpoints, auth flow, and common queries — researched-once-saved-forever.

**Note:**
- **Canale `script` Google Workspace attivo** (2026-07-16): SA `aios-workspace@soliwkr.iam` con domain-wide delegation impersona `info@trovatemi.it`. Docs/Drive/Sheets/Gmail/Calendar gestibili headless via `tools/`. Guida completa in `references/google-workspace-api.md`. È più capace del connettore MCP (es. l'MCP Drive non edita i Doc; lo `script` sì).
- Stripe MCP richiede autorizzazione (connettore claude.ai da attivare in impostazioni). Finché non è autorizzato, la capability non è disponibile in sessione.
- Cloudflare Developer Platform e Airtable MCP sono disponibili in questo ambiente (stack edge: Workers/D1/R2/KV). Aggiungere righe se entrano nel flusso operativo.
- Gap prioritario: **Fatture in Cloud ↔ Stripe** per la fatturazione SDI, prima del primo cliente pagante.
- **Canali pianificati, non ancora attivi** (tutti da costruire — vedi guardrail sistemista): pagina Instagram/Facebook, centralino FreePBX su VPS per il call center rank-and-rent, alias `chris@trovatemi.it`, eventuale Google Chat operativa con email dedicata per l'interno. Non contano come connessioni finché non esistono.
- **Tracciamento informale:** pagamenti probabilmente sul foglio Google master (da confermare); il lavoro/pipeline oggi è tracciato "a mente" — nessun sistema. Prima leva di ordine, non di build.
- **Drive:** upgrade a Business Starter in arrivo. Repo `trovatemi-os` = progetto backend greenfield (non codice esistente).
