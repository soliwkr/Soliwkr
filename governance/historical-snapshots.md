# Documenti storici e autorità residua

La storia esistente viene preservata. “Storico” non significa falso: significa che il documento
descrive uno stato, un onboarding o un modello precedente e non deve prevalere automaticamente
sulle fonti correnti del dominio.

## Snapshot del modello TROVATEMI precedente

| Documento | Contenuto storico | Uso consentito |
|---|---|---|
| `../aios-intake.md` | onboarding AIS-OS e offerta TROVATEMI a tre tier | contesto/provenienza; non fonte normativa o commerciale |
| `../context/about-business.md` | modello, ICP, founder e pricing precedente | confronto storico; route a `trovatemi-os` per lo stato corrente |
| `../context/priorities.md` | priorità commerciali Q3 2026 | snapshot datato, non priorità portfolio evergreen |
| `../memory/project_trovatemi_goal.md` | obiettivo e assunzioni delivery/vendita | memoria storica, da verificare prima dell'uso |
| `../memory/project_immobiliare_distribuzione.md` | insight di vendita | materiale derivato, soggetto alle fonti commerciali approvate |
| `../memory/project_audit_generator_skill.md` | idea di capability futura | backlog storico, non autorizzazione a implementare |
| `../CHANGELOG.md` | attività e affermazioni delle sessioni precedenti | log storico; non prova dello stato esterno corrente |
| `../references/google-workspace-api.md` | adapter e identificatori del setup precedente | riferimento operativo legacy, non requisito costituzionale |

Le memorie su identità, preferenze e setup locale possono essere utili, ma vanno distinte tra fatti
personali duraturi e snapshot di macchina/runtime. I file di workflow e i tool esistenti sono
artefatti legacy conservati; non autorizzano nuovo runtime applicativo dentro Soliwkr.

## Conflitti noti preservati

- pricing storico TROVATO/VISIBILE/INEVITABILE contro i due piani pubblici del nuovo modello;
- affermazioni discordanti sulla correzione del nome “Ivan”/“Vittorio” nei documenti esterni;
- copie duplicate di Stella Polare e Documento Totale su Drive;
- `trovatemi-os` descritto nello snapshot come backend greenfield, ora definito business control
  plane canonico;
- Climbo descritto come unica delivery, ora separato in Cashflow e High-Ticket Delivery Fabric;
- CLI-first e Claude come dipendenze implicite, ora semplici scelte di adapter/runtime.

Questa PR registra i conflitti ma non modifica dati o repository esterni e non riscrive gli
snapshot per farli apparire coerenti a posteriori.

## Regola per l'onboarding storico

`aios-intake.md` non può aggiornare automaticamente `AGENTS.md`, governance, registry o fonti di
un business. Un futuro onboarding può estrarre proposte, ma deve confrontarle con l'autorità del
dominio e ottenere l'approvazione di Chris prima di modificare documenti normativi.
