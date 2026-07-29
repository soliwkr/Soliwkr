# Connection Registry

Una connessione è un'astrazione verso un sistema; CLI, API, MCP e connector sono adapter
sostituibili. Lo stato non autorizza operazioni e non certifica accesso: prima di ogni uso verificare
permessi, fonte e gate. Nessun valore segreto appartiene a questo repository.

## Schema comune

Ogni voce specifica owner, scopo, dati, letture/scritture, adapter, runtime, autorizzazioni, fonte,
gate, custodia prevista dei secret, audit e stato.

## Google Workspace

- **Sistema proprietario:** TROVATEMI per il workspace business; Chris per eventuali spazi personali.
- **Scopo/dati:** Gmail, Calendar, Drive, Docs, Sheets, Tasks e directory nei limiti autorizzati.
- **Letture:** messaggi/metadati, eventi, file, documenti, fogli e task pertinenti.
- **Scritture:** bozze/invii, eventi, documenti, righe e task solo con scope e gate applicabili.
- **Adapter preferiti:** GWS CLI iniziale possibile per Hermes su VPS Hetzner; connector, API, MCP
  o CLI equivalente per altri runtime. Nessun adapter è costituzionale.
- **Runtime compatibili:** Hermes, Codex, Claude e workflow autorizzati.
- **Autorizzazioni:** identità dedicata, scope minimi, delega solo se approvata dal dominio.
- **Fonte canonica:** servizio Workspace proprietario; documenti normativi secondo
  `../governance/source-of-truth.md`.
- **Gate umano:** invii sensibili, modifiche normative, promesse e operazioni irreversibili.
- **Secret:** secret store del runtime/VPS o piattaforma connector; mai nel repo.
- **Audit:** attore/subject, scope, risorsa, operazione, esito e correlation id.
- **Stato:** attiva nel setup legacy, non verificata in questo task. Nessuna installazione GWS CLI.

## GitHub

- **Sistema proprietario:** organizzazione/account proprietario di ciascun repository.
- **Scopo/dati:** repository, branch, commit, issue, PR, review, Actions e metadata accessibili.
- **Letture:** stato repository, diff, PR/CI e release.
- **Scritture:** branch, commit, PR, commenti e workflow dispatch nei repository autorizzati.
- **Adapter preferiti:** API o `gh`; connector/MCP se disponibile.
- **Runtime compatibili:** Codex, Claude, Hermes e CI.
- **Autorizzazioni:** token/app con accesso al solo repository e permessi minimi.
- **Fonte canonica:** GitHub per stato durevole di codice, commit, PR e CI.
- **Gate umano:** merge, release, modifiche normative e operazioni distruttive.
- **Secret:** secret store Codex/GitHub, GitHub App o runtime; non file repository.
- **Audit:** commit firmati/attribuiti, PR, review, Actions e log adapter.
- **Stato:** attiva tramite integrazione Codex; accesso diretto non verificato.

## Cloudflare

- **Sistema proprietario:** account TROVATEMI/Studio Pura Luce secondo risorsa.
- **Scopo/dati:** Workers, D1, R2, Queues, Workflows, DNS, domini, log e analytics autorizzati.
- **Letture:** configurazione, schema/stato consentito, deploy e osservabilità.
- **Scritture:** deploy, query/migrazioni, binding, queue/workflow e DNS soltanto per capability autorizzate.
- **Adapter preferiti:** API/CLI `wrangler`; connector o MCP per lettura/observability.
- **Runtime compatibili:** CI, Codex, Claude, Hermes e runtime edge.
- **Autorizzazioni:** token scoped per account/zone/risorsa e ambienti separati.
- **Fonte canonica:** D1 per stato operativo designato; GitHub/contratti per codice e schema approvati.
- **Gate umano:** domini, deploy pubblici previsti, migrazioni irreversibili e cancellazioni.
- **Secret:** Cloudflare secrets/CI/runtime secret store; `.dev.vars` solo locale e mai versionato.
- **Audit:** idempotency/correlation id, deploy id, query/migrazione, retry, errore e attore.
- **Stato:** pianificata/non verificata per la nuova architettura.

## Climbo

- **Sistema proprietario:** TROVATEMI per tenant, offerte e delivery configurata.
- **Scopo/dati:** configurazione white-label, business/location, downstream lead, delivery e pagamenti disponibili.
- **Letture:** configurazioni e stato necessari alle due corsie.
- **Scritture:** setup e sincronizzazioni downstream autorizzate; mai sovrascrivere il record D1 primario.
- **Adapter preferiti:** API/connector; browser soltanto se autorizzato e auditabile.
- **Runtime compatibili:** workflow Cloudflare, Hermes e agenti supervisionati.
- **Autorizzazioni:** account/chiavi dedicate con scope minimo.
- **Fonte canonica:** Climbo per il proprio stato applicativo; `trovatemi-os` per offerte/governance;
  D1 per lead e stato high-ticket.
- **Gate umano:** prezzi, promesse, configurazione pubblica e conversioni.
- **Secret:** secret store del runtime o connector.
- **Audit:** payload minimizzati, mapping D1/Climbo, retry, errore e attore.
- **Stato:** attiva nel legacy, integrazione target non verificata.

## OVHcloud

- **Sistema proprietario:** Chris/Studio Pura Luce secondo contratto.
- **Scopo/dati:** domini, DNS, hosting o servizi acquistati presso OVHcloud.
- **Letture:** inventario, scadenze e configurazione autorizzata.
- **Scritture:** DNS, rinnovi e configurazioni solo dopo gate applicabili.
- **Adapter preferiti:** API o CLI ufficiale/equivalente; connector se disponibile.
- **Runtime compatibili:** Hermes e agenti infrastrutturali autorizzati.
- **Autorizzazioni:** key scoped e identità dedicata.
- **Fonte canonica:** pannello/API OVHcloud per risorse possedute; registry business per assegnazione.
- **Gate umano:** acquisto, trasferimento, rinnovo/assegnazione domini e modifiche distruttive.
- **Secret:** secret store VPS/runtime.
- **Audit:** risorsa, diff, approvazione, operazione ed esito.
- **Stato:** non verificata.

## Telegram

- **Sistema proprietario:** Chris.
- **Scopo/dati:** cockpit operativo privato iniziale per Hermes.
- **Letture:** comandi e conversazioni esplicitamente indirizzati al bot/runtime.
- **Scritture:** brief, alert, draft e richieste di approvazione.
- **Adapter preferiti:** Bot API.
- **Runtime compatibili:** Hermes e workflow di notifica autorizzati.
- **Autorizzazioni:** bot dedicato, allowlist chat/user e scope applicativo.
- **Fonte canonica:** nessuna; decisioni e promesse rilevanti vanno registrate nel sistema appropriato.
- **Gate umano:** azioni sensibili richieste dal canale devono essere confermate e validate server-side.
- **Secret:** secret store VPS/runtime.
- **Audit:** update/message id, attore, comando, approvazione, azione ed esito; contenuto minimizzato.
- **Stato:** pianificata.

## WhatsApp

- **Sistema proprietario:** TROVATEMI.
- **Scopo/dati:** conversazioni con prospect, clienti e renter.
- **Letture:** messaggi e metadata consentiti da consenso, policy e scopo commerciale.
- **Scritture:** draft o invii autorizzati, template approvati dove richiesto.
- **Adapter preferiti:** API/connector ufficiale; nessuna automazione personale non autorizzata.
- **Runtime compatibili:** sistemi TROVATEMI e Hermes con permessi separati.
- **Autorizzazioni:** account business, consenso e ruoli minimi.
- **Fonte canonica:** canale di comunicazione, non fonte di lead/cliente; record rilevanti in D1/business OS.
- **Gate umano:** messaggi sensibili, promesse, contratti e conversioni.
- **Secret:** provider/secret store del runtime.
- **Audit:** destinatario pseudonimizzato, template/draft, approvazione, invio ed esito.
- **Stato:** attiva manualmente, adapter non verificato.

## Google Search Console

- **Sistema proprietario:** proprietario verificato di ciascuna property.
- **Scopo/dati:** property, query, pagine, performance, sitemap e inspection consentita.
- **Letture:** performance e stato indicizzazione.
- **Scritture:** sitemap o azioni supportate solo per property autorizzate.
- **Adapter preferiti:** API; connector/MCP o CLI equivalente.
- **Runtime compatibili:** RankEmpire, Hermes e agenti analytics.
- **Autorizzazioni:** accesso per singola property, read-only di default.
- **Fonte canonica:** Search Console per la propria telemetria, non per lead o decisioni commerciali.
- **Gate umano:** associazione property e scritture con impatto pubblico.
- **Secret:** OAuth/secret store del runtime o connector.
- **Audit:** property, query/operazione, intervallo, attore ed esito.
- **Stato:** non verificata.

## Google Analytics

- **Sistema proprietario:** proprietario di ciascuna property TROVATEMI/asset.
- **Scopo/dati:** eventi, traffico, conversioni e configurazioni consentite.
- **Letture:** report e metadata property.
- **Scritture:** configurazioni/eventi solo tramite implementazioni approvate.
- **Adapter preferiti:** Data/Admin API, connector o MCP.
- **Runtime compatibili:** analytics, RankEmpire, Hermes e agenti autorizzati.
- **Autorizzazioni:** property-scoped, read-only di default.
- **Fonte canonica:** Analytics per telemetria; D1 per lead/stati e business OS per definizioni approvate.
- **Gate umano:** nuove conversioni, tracking pubblico e modifiche di configurazione.
- **Secret:** piattaforma connector o runtime secret store.
- **Audit:** property, intervallo/config diff, attore ed esito.
- **Stato:** non verificata.

## Resend

- **Sistema proprietario:** business/dominio mittente.
- **Scopo/dati:** domini mittenti, template, messaggi transazionali, delivery e bounce.
- **Letture:** stato dominio, log minimizzati e metriche.
- **Scritture:** invio e gestione configurazioni autorizzate.
- **Adapter preferiti:** API/SDK; connector se disponibile.
- **Runtime compatibili:** workflow Cloudflare e sistemi TROVATEMI.
- **Autorizzazioni:** API key scoped e domini verificati.
- **Fonte canonica:** provider per delivery; business OS/D1 per intento, destinatario e stato business.
- **Gate umano:** template/promesse sensibili, campagne e modifiche dominio.
- **Secret:** Cloudflare/CI/runtime secret store.
- **Audit:** message id, template/versione, approvazione, esito/bounce senza contenuto sensibile.
- **Stato:** non verificata.

## Skool

- **Sistema proprietario:** account/community titolare; corpus acquisito in `climbo-audit`.
- **Scopo/dati:** materiali, community, coaching e metadata consentiti.
- **Letture:** contenuti accessibili e autorizzati per intelligence.
- **Scritture:** nessuna per default; eventuali interazioni richiedono autorizzazione separata.
- **Adapter preferiti:** API/connector ufficiale; CLI di acquisizione documentata solo se verificata.
- **Runtime compatibili:** pipeline `climbo-audit` e agenti di ricerca autorizzati.
- **Autorizzazioni:** account legittimo, rispetto dei termini e minimo privilegio.
- **Fonte canonica:** Skool per il grezzo; `climbo-audit` per corpus/elaborati; approvazione nel business OS.
- **Gate umano:** acquisizione estesa, pubblicazione e recepimento commerciale.
- **Secret:** runtime di acquisizione, mai repository o log.
- **Audit:** source id/URL, timestamp, acquisizione, trasformazioni e provenienza.
- **Stato:** attiva secondo snapshot, non verificata in questo task.

## YouTube

- **Sistema proprietario:** proprietario del canale/materiale.
- **Scopo/dati:** video, transcript, metadata, analytics e commenti consentiti.
- **Letture:** contenuti pubblici o dati account autorizzati.
- **Scritture:** upload/metadata/commenti soltanto con capability e gate specifici.
- **Adapter preferiti:** YouTube Data/Analytics API, connector o CLI equivalente.
- **Runtime compatibili:** intelligence e agenti contenuto autorizzati.
- **Autorizzazioni:** OAuth/scopes minimi; read-public quando sufficiente.
- **Fonte canonica:** YouTube per contenuto pubblicato/telemetria; corpus proprietario per derivati.
- **Gate umano:** pubblicazione, modifica o messaggio esterno.
- **Secret:** connector o runtime secret store.
- **Audit:** channel/video id, operazione, attore, approvazione ed esito.
- **Stato:** non verificata.

## PrintingPress.dev e CLI locali di acquisizione

- **Sistema proprietario:** tool/vendor e repository che possiede la pipeline generata.
- **Scopo/dati:** generazione di CLI agent-native e possibili acquisizioni documentate.
- **Letture/scritture:** dipendono dal servizio target e non sono ereditate dal generatore.
- **Adapter preferiti:** CLI generata, solo dopo verifica di codice, termini e permessi.
- **Runtime compatibili:** shell locale o VPS; non Cloudflare Workers.
- **Autorizzazioni:** quelle del servizio target, scoped e custodite fuori dal repo.
- **Fonte canonica:** servizio target per i dati; GitHub del tool per codice/versione.
- **Gate umano:** installazione, acquisizione, pubblicazione e ogni scrittura esterna.
- **Secret:** secret store del runtime target.
- **Audit:** versione/binario, origine, comando, target, volumi, esito ed errori.
- **Stato:** sperimentale/non verificata. Il repository cita PrintingPress ma non documenta una CLI
  Skool installata e verificata; non va assunta esistente.

## Regole trasversali sui secret

- Secret, token e credenziali non sono configurazioni pubbliche.
- I valori non compaiono in repository, documenti, esempi, output agente o log.
- Le variabili pubbliche possono essere versionate solo se non consentono accesso e sono dichiarate.
- Ogni adapter usa identità dedicate, scope minimi, rotazione e revoca.
- La posizione concreta dipende dal runtime: secret store Codex/GitHub, Cloudflare secret, connector
  gestito o secret store VPS. Il registry registra il sistema, mai il valore.
