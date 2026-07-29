# Soliwkr — costituzione dell'Operator & Portfolio AIOS

Questo file è l'istruzione canonica, tool-agnostic e portabile per ogni agente che opera in
questo repository. Gli adapter specifici di un prodotto, incluso `CLAUDE.md`, sono subordinati a
questo documento. In caso di conflitto, fermati, indica le fonti concorrenti e chiedi a Chris.

## Mandato

`soliwkr/Soliwkr` è l'Operator & Portfolio AIOS personale di Chris: costituzione operativa,
identità dell'operatore, priorità trasversali, registro di sistemi e capacità, routing verso le
fonti autorevoli, memoria e decisioni cross-project.

È un punto unico di ingresso e una mappa delle autorità, non un unico datastore fisico. Non è:

- il business OS di TROVATEMI;
- il database operativo di lead, asset, clienti o renter;
- il runtime di un agente;
- un monorepo o contenitore degli altri repository;
- un sostituto delle fonti canoniche possedute dai singoli domini.

Ogni dominio conserva una sola fonte autorevole. Soliwkr registra dove si trova, chi la possiede,
come interrogarla e quali gate applicare, senza copiarla o sostituirla.
Questo routing di portfolio comprende anche sistemi autonomi che non appartengono a TROVATEMI:
la loro indipendenza, autorità e repository proprietario restano invariati.

## Mappa normativa

- `AGENTS.md` — costituzione e istruzioni portabili.
- `governance/source-of-truth.md` — ordine delle autorità e risoluzione dei conflitti.
- `governance/routing.md` — confini dei layer e routing tra sistemi.
- `governance/historical-snapshots.md` — documenti legacy e loro autorità residua.
- `registries/systems.md` — sistemi, repository, owner e confini.
- `registries/capabilities.md` — capacità disponibili o pianificate.
- `registries/connections.md` — connessioni astratte e adapter sostituibili.
- `decisions/log.md` — decisioni approvate, append-only.
- `CLAUDE.md` — solo adapter Claude.

## Separazione obbligatoria dei layer

1. **Operator & Portfolio AIOS:** Soliwkr; costituzione, registry, routing e memoria cross-project.
2. **Business OS:** control plane normativo di un business, per esempio `trovatemi-os`.
3. **Agent runtime:** processo che usa il contesto ed esegue operazioni, per esempio Hermes.
4. **Interfaccia:** cockpit sostituibile, per esempio Telegram, dashboard o CLI.
5. **Workflow deterministico:** automazione idempotente e osservabile, per esempio Cloudflare
   Queues e Workflows.
6. **Datastore canonico:** sistema proprietario dello stato operativo, per esempio D1 per lead,
   asset rank-and-rent e relativi stati.

Un layer non acquisisce autorità solo perché visualizza, elabora o trasporta i dati di un altro.
Dashboard e chat rappresentano la verità, non la creano. Gli agenti consultano e aggiornano solo
fonti autorizzate e non diventano essi stessi una fonte.

## Portabilità

Claude, Codex, Hermes, altri agenti, Telegram, dashboard, CLI e connector sono sostituibili.
Memoria, decisioni, contratti, modelli dati e fonti canoniche devono sopravvivere al cambio di
strumento. Non introdurre una dipendenza costituzionale da un runtime o adapter specifico.

## Regole operative per gli agenti

Prima di lavorare:

1. leggi questo file e i documenti di governance applicabili;
2. identifica il dominio proprietario e la sua fonte canonica;
3. dichiara scope, assunzioni, rischi e criteri di accettazione;
4. segnala ogni conflitto invece di scegliere silenziosamente una fonte;
5. usa il minimo privilegio e non registrare valori segreti;
6. non duplicare playbook, contratti o dati operativi posseduti altrove;
7. registra una decisione nel dominio che la possiede; usa Soliwkr solo per decisioni
   cross-project o per il routing.

Gli agenti possono leggere, confrontare, classificare, proporre, preparare draft, verificare ed
eseguire operazioni reversibili esplicitamente autorizzate.

## Gate umani

Chris approva sempre:

- identità e posizionamento;
- offerte, prezzi e promesse;
- procedure ufficiali e modifiche a fonti normative;
- acquisto e assegnazione di domini;
- deploy pubblici quando previsto;
- messaggi esterni sensibili;
- contratti;
- conversione Opportunity → Client;
- conversione asset → Renter;
- operazioni irreversibili.

In assenza di approvazione, prepara una proposta o un draft e fermati.

## Secret e configurazione

- Nessun valore segreto, token o credenziale nel repository, negli esempi o nei log.
- Distingui variabili pubbliche, configurazioni non segrete e secret.
- I registry indicano soltanto il sistema previsto per custodire i secret.
- Applica minimo privilegio, identità separate e audit trail.
- Non assumere che `.env`, una CLI o uno specifico secret store sia universale.

## Sviluppo con Codex Cloud

Codex Cloud è la superficie primaria di sviluppo: un repository, un task, una branch e una PR alla
volta. `main` è la fonte iniziale e GitHub conserva lo stato durevole. Il repository e le fonti
canoniche prevalgono sulla memoria della conversazione. Non richiedere lavoro locale implicito e
non modificare altri repository nello stesso task.

## Documenti storici

`aios-intake.md`, parte di `context/`, `memory/`, `CHANGELOG.md` e altri documenti elencati in
`governance/historical-snapshots.md` descrivono il precedente modello TROVATEMI. Conservali come
storia, ma non usarli automaticamente come stato normativo o commerciale corrente.
