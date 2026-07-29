# Registro dei sistemi e repository

Stato e ubicazioni sono dichiarazioni architetturali; dove l'accesso non è stato verificato in
questo task, il registro lo segnala senza inventare dettagli operativi.

| Sistema | Owner | Ruolo e fonte canonica | Confini | Lifecycle dichiarato | Verifica in questo task |
|---|---|---|---|---|---|
| `soliwkr/Soliwkr` | Chris | Operator & Portfolio AIOS; costituzione, registry, routing e memoria cross-project | non business OS, datastore o runtime | esistente, attivo | verificato nel checkout |
| `soliwkr/trovatemi-os` | TROVATEMI / Chris | business control plane canonico: strategia, offerte, clienti, onboarding, contratti, procedure, approvazioni e governance | non contiene fisicamente gli altri repository | esistente, in sviluppo | non verificato esternamente |
| `soliwkr/rankempire-italia` | TROVATEMI / Chris | execution plane high-ticket e factory: acquisizione, generazione, lead, attribuzione, proof e renter; D1 backbone | non è portfolio AIOS né template del singolo sito | esistente, factory in sviluppo | non verificato esternamente |
| `StudioPuraLuce/astro-rank-rent` | Studio Pura Luce | template canonico dei siti generati, subordinato alla factory | non control plane; non fonte di lead/clienti/decisioni | esistente | non verificato esternamente |
| repository rank-and-rent generati | Studio Pura Luce | codice, Worker, dominio e deploy autonomi del singolo asset | non clonati in Soliwkr/TROVATEMI OS; inviano lead D1-first | esistenti per singolo asset | inventario non verificato |
| `soliwkr/trovatemi-web` | TROVATEMI | frontend pubblico su Cloudflare Workers; presentation e conversion plane Climbo Cashflow | non business OS, site factory o fonte canonica lead | esistente, in sviluppo | non verificato esternamente |
| `soliwkr/climbo-audit` | Chris | intelligence/evidence layer: audit, Skool, transcript, coaching, materiali e LLM Wiki | non runtime o database; elaborazioni canoniche solo dopo approvazione e recepimento | esistente | non verificato esternamente |
| `soliwkr/esim` | Chris | repository e control plane canonico del prodotto Senzaroaming: codice, architettura, roadmap, decisioni prodotto, workflow editoriali, SEO intelligence e riferimenti allo stato operativo | sistema autonomo, indipendente da TROVATEMI, RankEmpire, Climbo e Soliwkr; Soliwkr effettua solo routing | esistente, in sviluppo attivo | non verificato esternamente |
| `senzaroaming.it` | sistema `soliwkr/esim` | superficie pubblica e prodotto eSIM; presentation, acquisition e product plane governato dalle fonti eSIM | non business OS, AIOS o fonte canonica cross-project; distinto da `trovatemi-web` | esistente, prodotto pubblico in produzione | stato operativo corrente non verificato esternamente |
| Cloudflare D1 | sistema proprietario TROVATEMI/RankEmpire | stato canonico di lead, asset rank-and-rent e relativi stati operativi | non fonte di strategia, offerte o decisioni normative | stato componente da verificare | non verificato |
| Cloudflare Workers | sistemi deployanti | API e runtime edge | esegue contratti; non crea autorità | stato componente da verificare | non verificato |
| Cloudflare Queues/Workflows | sistemi deployanti | workflow deterministici, idempotenti e osservabili | richiede log, retry, error handling e gate | stato componente da verificare | non verificato |
| Cloudflare R2 | sistemi deployanti | artefatti e documenti operativi appropriati | non datastore normativo universale | stato componente da verificare | non verificato |
| Climbo Cashflow | TROVATEMI | motore white-label low-ticket presentato da `trovatemi-web` | indipendente da RankEmpire; fonte commerciale resta `trovatemi-os` | esistente, operativo | configurazione corrente non verificata |
| Climbo High-Ticket Delivery Fabric | RankEmpire/TROVATEMI | location/business downstream per asset e renter | D1 resta primario; Climbo non è control plane | pianificato, in integrazione | non verificato |
| Hermes | Chris | futuro runtime persistente del cofounder/direttore operativo, inizialmente su VPS Hetzner | sostituibile; non fonte canonica né datastore | pianificato | non applicabile |
| Telegram | Chris | cockpit operativo privato iniziale di Hermes | interfaccia sostituibile, non fonte canonica | pianificato per Hermes | non applicabile |
| WhatsApp | TROVATEMI | canale separato per prospect, clienti e renter | non cockpit privato né fonte canonica | esistente | adapter non verificato |

## Relazioni vincolanti

- Soliwkr instrada a `trovatemi-os`; non ne duplica strategia o stato.
- `trovatemi-os` governa TROVATEMI ma non ingloba i repository del portfolio.
- `rankempire-italia` orchestra il template e gli asset autonomi.
- Gli asset registrano il lead in D1 prima di qualsiasi inoltro.
- `trovatemi-web` può acquisire richieste, ma la verità viene trasferita al datastore proprietario.
- `climbo-audit` distingue fonti grezze, elaborazioni e conclusioni approvate.
- Climbo è downstream rispetto a D1 nella corsia high-ticket.
- Hermes usa costituzione e routing; Telegram è soltanto una possibile interfaccia.
- Soliwkr instrada Senzaroaming a `soliwkr/esim`, senza duplicarne documentazione o stato e senza
  associarlo a TROVATEMI.

## Lifecycle e verifica

Il lifecycle dichiara esistenza e maturità note; la verifica descrive soltanto l'evidenza raccolta
in questo task. “Non verificato” non nega l'esistenza e “esistente” non certifica accesso, salute o
configurazione. Il sistema proprietario deve confermare accesso, stato e contratti prima di ogni
operazione.
