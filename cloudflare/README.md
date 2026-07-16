# cloudflare/

Progetti **Wrangler** per le automazioni che devono girare su schedule / non presidiate — il
rimpiazzo di Trigger.dev. Vedi `../ARCHITECTURE.md` per il modello completo e la mappa
Trigger.dev → Cloudflare.

**Local-first**: questa cartella resta vuota finché non serve deployare la prima automazione.
Non scaffoldare un progetto Wrangler "a vuoto".

## Struttura attesa (una cartella per automazione)

```
cloudflare/
  <automation-name>/
    wrangler.jsonc     # config: name, main, compatibility_date, triggers.crons, bindings
    src/
      index.ts         # Worker entry (scheduled handler) — o index.py per Python (beta)
      <workflow>.ts    # Cloudflare Workflow (step.do, sleep, waitForEvent)
    .dev.vars          # secret LOCALI (gitignored) — NON committare
    package.json
```

## Setup della prima automazione

```bash
# dalla cartella cloudflare/
npm create cloudflare@latest <automation-name>
# scegli il template (Worker + Workflow); poi:
cd <automation-name>
wrangler dev          # dev locale (triggera anche lo scheduled handler)
```

## Comandi chiave

| Azione | Comando |
|---|---|
| Dev locale | `wrangler dev` |
| Deploy (solo con ok utente) | `wrangler deploy` |
| Log live | `wrangler tail` |
| Secret in prod | `wrangler secret put <KEY>` |

## Secret

- Locale: `.dev.vars` (formato dotenv, gitignored).
- Produzione: `wrangler secret put <KEY>` o dashboard → aggiungi a **staging e prod**.
- Mai committare `.dev.vars`. Mai loggare i valori.

## Lingua

TS (GA) di default; Python (beta) se preferito — richiede i compat flag
`python_workers` + `python_workflows` e `compatibility_date >= 2025-08-01`.
