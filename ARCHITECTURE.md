# Architettura — WAT + Cloudflare (estende CLAUDE.md)

Questo documento estende `CLAUDE.md` con lo stack concreto. `CLAUDE.md` resta la fonte dei
principi WAT; qui si definisce **come** eseguire: quale strumento scegliere e dove far girare il
codice.

---

## I tre layer WAT (invariati)

1. **Workflows** — SOP in markdown in `workflows/`.
2. **Agent** — l'agente (io) che orchestra: legge la SOP, sceglie gli strumenti, gestisce errori.
3. **Tools** — l'esecuzione deterministica. Vedi la gerarchia sotto.

---

## Gerarchia di selezione dello strumento (Layer 3)

**Principio guida: CLI-first, per QUALSIASI cosa.** Preferisci sempre una CLI. Nell'ordine:

1. **CLI esistente** — usa la CLI ufficiale/nativa del servizio se esiste già:
   - `gcloud` / `gsutil` / `bq` (Google Cloud), `gh` (GitHub), `wrangler` (Cloudflare),
     e qualsiasi altra CLI del vendor.
   - È il default: token-efficient, deterministica, testabile.
2. **CLI generata con printingpress.dev** — se il servizio **non ha** una CLI adatta, generane una
   (binario Go agent-native) con printingpress. On-demand, solo quando serve. Vedi sezione dedicata.
3. **Connettori (MCP)** — quando una CLI non è pratica e un connettore già disponibile copre il
   bisogno senza scrivere codice: **Gmail, Google Calendar, Google Drive, Airtable** (+ altri
   presenti in sessione). Buoni per operazioni interattive puntuali.
4. **Tool Python (`tools/*.py`)** — API dirette, glue, trasformazioni, orchestrazione locale.
   Usano `tools/config.py` per caricare `.env` in modo coerente. Ultima scelta, quando nessuna CLI
   o connettore calza.

> Regola pratica: prima di scrivere Python, chiediti "esiste una CLI? posso generarla? c'è un
> connettore?". Scendi di livello solo quando il precedente non è praticabile.

---

## Dove gira il codice — tre runtime

Tre contesti di esecuzione distinti. Sceglili con l'albero decisionale sotto.

| Runtime | Cosa | Quando |
|---|---|---|
| **Locale (shell)** | CLI (native o printingpress) + tool Python | Task on-demand nella sessione; sviluppo |
| **Connettori** | MCP Gmail/Drive/Calendar/Airtable | Operazioni interattive senza codice |
| **Cloudflare (edge)** | Workflows + Cron Triggers | Automazioni schedulate / non presidiate |

**Albero decisionale runtime:**
- L'automazione gira **on-demand** quando la lancio io nella sessione? → **Locale** (CLI/Python).
- Deve girare **su schedule o non presidiata** (senza un umano/agente che la avvia)? → **Cloudflare**.
  - Nota: le CLI (binari Go) e i tool Python **non girano dentro un Worker**. Se un'automazione
    deployata deve riusarli, il Worker fa da thin scheduler/orchestrator e delega a un host con
    shell (VM/container). Preferisci riscrivere la logica in TS/Python-Worker quando possibile.

---

## Tier di deploy: Cloudflare (rimpiazzo di Trigger.dev)

Local-first: si sviluppa in locale e si va su Cloudflare **solo quando serve lo schedule**.
Lingua scelta per-automazione: **TypeScript (GA)** default per stabilità, **Python (beta)** quando
la preferenza Python prevale.

**Mappa Trigger.dev → Cloudflare:**

| Trigger.dev | Cloudflare |
|---|---|
| Scheduled task (cron) | Cron Trigger → Worker `scheduled()` |
| task / step (`run`) | Workflow `step.do` (durabile, retry per-step) |
| `triggerAndWait` | Trigger di un'istanza Workflow figlia + await |
| Wait / `wait.for` | `step.sleep` / `sleepUntil` (fino a 365gg, no compute) |
| Wait per webhook/approvazione | `step.waitForEvent` |
| Queue / concorrenza | Cloudflare Queues (fan-out, buffering) |
| Env vars dashboard | `wrangler secret put` + dashboard / `.dev.vars` (locale) |
| Deploy + log | `wrangler deploy`, `wrangler tail`, Observability MCP |

**Cron syntax** (UTC), in `wrangler.jsonc`:
```jsonc
{ "triggers": { "crons": ["*/30 * * * *", "0 9 * * *"] } }
```

| Schedule | Cron |
|---|---|
| Ogni 30 min | `*/30 * * * *` |
| Ogni ora | `0 * * * *` |
| 9:00 giornaliero | `0 9 * * *` |
| Lunedì 8:00 | `0 8 * * 1` |

Quando fai polling su schedule, imposta la finestra di lookback leggermente più larga
dell'intervallo del cron (es. 25h per un cron giornaliero) per non perdere item ai bordi tra run.

**Comandi Wrangler chiave:**
- `npm create cloudflare@latest` — scaffold progetto (alla prima automazione da deployare)
- `wrangler dev` — dev locale (triggera anche lo `scheduled` handler)
- `wrangler deploy` — deploy in produzione
- `wrangler tail` — log live
- `wrangler secret put <KEY>` — secret in produzione; `.dev.vars` per il locale

**Cloudflare MCP ufficiale** (connettore "Cloudflare Developer Platform" presente ma **NON
autorizzato** in sessione — va autorizzato dalle impostazioni connettori claude.ai per usarlo qui):
API MCP, Docs, Bindings, Builds, Observability, Logpush.

---

## Secrets & env vars — regole di sicurezza

- **Ogni secret vive solo in `.env`** (locale, per tool/CLI) — mai hardcoded, mai loggato.
- Per Cloudflare: **`.dev.vars`** in locale, **`wrangler secret put`** / dashboard in produzione.
  Aggiungi ogni chiave a staging **e** prod prima del deploy (causa n.1 di fallimenti in prod).
- Valida sempre in cima al codice: se una var manca, fallisci con messaggio chiaro
  (`tools/config.py` → `require_env()` fa questo per i tool Python).
- `.gitignore` copre già `.env`, `.dev.vars*`, `credentials.json`, `token.json`, `.tmp/`.

---

## Auth Google

Gerarchia coerente con il CLI-first:
1. **CLI**: `gcloud auth login` / `gcloud auth application-default login` per Google Cloud;
   `gcloud`/`gsutil`/`bq` per le operazioni.
2. **Connettori**: Gmail, Calendar, Drive già disponibili per operazioni interattive sui dati utente.
3. **API diretta (Python)** quando serve:
   - Dati utente (Gmail/Drive/Sheets per conto dell'utente) → **OAuth**:
     `credentials.json` + `token.json` (già gitignored).
   - Servizi Google Cloud server-to-server → **service account** (JSON key, tenuta fuori dal repo,
     path via env var `GOOGLE_APPLICATION_CREDENTIALS`).

---

## printingpress.dev — generatore di CLI

Genera CLI agent-native (binari Go statici + MCP server + skill Claude) da qualsiasi API/sito.
MIT, gratis. Si usa **quando un servizio non ha già una CLI adatta**.

- **Caveat**: i binari Go **non girano dentro un Worker Cloudflare** — solo in ambienti con shell
  (locale/VM/container).
- **Requisito**: Go **1.26.5+** (installato: 1.26.2 → aggiornare prima del primo uso).
- **Install** (on-demand): `curl -fsSL https://raw.githubusercontent.com/mvanhorn/cli-printing-press/main/scripts/install.sh | bash`
  oppure `go install github.com/mvanhorn/cli-printing-press/...@latest` + registrazione skill.
- **Uso** (slash command in Claude Code): `/printing-press <app-o-url>` per generare;
  `/printing-press-polish`, `/printing-press-publish`, ecc. Pipeline ~30–60 min per CLI.
- Output per servizio: `<svc>-pp-cli` (binario), `<svc>-pp-mcp` (MCP), skill Claude, scorecard.

---

## Struttura del repo

```
CLAUDE.md              # Principi WAT (fonte istruzioni)
ARCHITECTURE.md        # Questo file: stack concreto
tools/                 # Tool Python + config.py (loader .env condiviso)
workflows/             # SOP markdown (incl. _workflow_builder.md)
cloudflare/            # Progetti Wrangler (uno per automazione deployata) — vedi cloudflare/README.md
.tmp/                  # File temporanei rigenerabili (gitignored)
.env                   # Secret locali (gitignored)
.env.example           # Template
```
