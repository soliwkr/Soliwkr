# Capability Registry

Le capability descrivono **cosa** può fare l'AIOS e dove deve instradare il lavoro, non quale
prodotto o prompt usare. “Agente autorizzato” non implica accesso: servono anche connessione,
permessi e gate applicabili.

## `apply-pesca-method`

- **Scopo:** framework commerciale generale e riutilizzabile per nicchie, contenuti, outbound,
  call, DM, qualificazione, booking e follow-up.
- **Sistema proprietario:** fonte P.E.S.C.A. designata da Chris; ubicazione non verificata qui.
- **Fonte canonica:** framework originale approvato, non questo registry.
- **Input:** obiettivo, nicchia, contesto, canale, evidenze e vincoli.
- **Output:** strategia o draft attribuito e tracciabile.
- **Runtime compatibili:** Codex, Claude, Hermes e runtime futuri con accesso autorizzato.
- **Agenti autorizzati:** agenti incaricati da Chris, in lettura/proposta.
- **Operazioni consentite:** consultare, applicare, confrontare, preparare draft; non riscrivere il
  metodo o copiarlo integralmente.
- **Gate umano:** approvazione per promesse, posizionamento, messaggi sensibili e modifiche al metodo.
- **Log richiesto:** fonte/versione, input, output, agente, approvazione e destinazione.
- **Disponibilità/maturità:** disponibile tramite fonti esterne governate.
- **Verifica adapter:** nessun adapter verificato in questo task.

## `operate-trovatemi-os`

- **Scopo:** applicazione verticale alla strategia, vendita e operatività TROVATEMI.
- **Sistema proprietario:** `soliwkr/trovatemi-os`.
- **Fonte canonica:** ordine TROVATEMI definito dal business OS, incluse le fonti approvate.
- **Input:** richiesta operativa, stato autorizzato, Stella Polare, Documento Totale, Architettura
  Operativa e contratti applicabili.
- **Output:** query, proposta, draft, task o aggiornamento autorizzato nel sistema proprietario.
- **Runtime compatibili:** Codex, Claude, Hermes e workflow autorizzati.
- **Agenti autorizzati:** agenti con ruolo e permessi TROVATEMI espliciti.
- **Operazioni consentite:** leggere, confrontare, proporre e compiere scritture reversibili
  autorizzate; non duplicare P.E.S.C.A.
- **Gate umano:** tutte le materie elencate in `../AGENTS.md`, inclusi prezzi e conversioni.
- **Log richiesto:** audit trail nel business OS, correlazione con attore, fonte e approvazione.
- **Disponibilità/maturità:** capability governata disponibile; operatività del business OS in sviluppo.
- **Verifica adapter:** nessun adapter operativo verificato in questo task.

## `trovatemi-sales-playbook`

- **Scopo:** vendita, trial, qualificazione, demo, obiezioni, follow-up e onboarding TROVATEMI.
- **Sistema proprietario:** `soliwkr/trovatemi-os`.
- **Fonte canonica:** Stella Polare, Documento Totale e Sales Playbook approvato nel business OS.
- **Input:** prospect/opportunity, canale, evidenze, offerta e fase pipeline.
- **Output:** qualificazione, draft, proposta di next step e record commerciale.
- **Runtime compatibili:** Codex, Claude, Hermes e strumenti commerciali autorizzati.
- **Agenti autorizzati:** agenti commerciali autorizzati, senza impersonare Chris.
- **Operazioni consentite:** consultare e preparare; inviare solo se esplicitamente autorizzato.
- **Gate umano:** offerte, prezzi, promesse, messaggi sensibili, contratti e Opportunity → Client.
- **Log richiesto:** fonte/versione, opportunity, bozze/invii, approvazione ed esito.
- **Disponibilità/maturità:** fonti e playbook esistenti; recepimento canonico e operational adapter
  da verificare separatamente. I soli piani pubblici indicati per il nuovo modello sono TROVATO
  €199 e INEVITABILE €399; la fonte commerciale in `trovatemi-os` prevale.
- **Verifica adapter:** non verificato in questo task.

## `climbo-intelligence`

- **Scopo:** intelligence da Skool, transcript, coaching, community wins, offerte, compliance e
  materiali Climbo.
- **Sistema proprietario:** `soliwkr/climbo-audit`.
- **Fonte canonica:** corpus con distinzione tra grezzo, elaborato e approvato.
- **Input:** fonti acquisite legalmente, metadati, domande e criteri di analisi.
- **Output:** evidenze, sintesi e raccomandazioni con provenienza.
- **Runtime compatibili:** agenti di ricerca in Codex, Claude o Hermes.
- **Agenti autorizzati:** agenti con accesso in lettura al corpus.
- **Operazioni consentite:** acquisire se autorizzato, classificare, confrontare e proporre.
- **Gate umano:** Chris approva qualsiasi recepimento in offerte, prezzi, promesse o procedure.
- **Log richiesto:** URL/ID fonte, data acquisizione, trasformazioni, confidenza e approvazione.
- **Disponibilità/maturità:** corpus e sistema esistenti; maturità operativa da verificare.
- **Verifica adapter:** non verificato in questo task.

## `rank-rent-site-factory`

- **Scopo:** creare progetto, contenuti, repository, deploy, dominio e lead capture per un asset.
- **Sistema proprietario:** `soliwkr/rankempire-italia`.
- **Fonte canonica:** contratti factory; template `StudioPuraLuce/astro-rank-rent`.
- **Input:** mercato approvato, progetto, contenuti, dominio e contratti di qualità/lead.
- **Output:** repository e deploy autonomo, dominio, capture D1-first e record dell'asset.
- **Runtime compatibili:** workflow deterministici e agenti autorizzati dalla factory.
- **Agenti autorizzati:** operatori RankEmpire con permessi minimi.
- **Operazioni consentite:** preparare e verificare; creare/deployare solo dopo i gate.
- **Gate umano:** mercato, qualità, acquisto/assegnazione dominio, deploy e monetizzazione/renter.
- **Log richiesto:** run id, input/versioni, verifiche, approvazioni, deploy e rollback.
- **Disponibilità/maturità:** esistente e in sviluppo. Non va reimplementata in Soliwkr.
- **Verifica adapter:** factory e adapter non verificati in questo task.

## `lead-operations`

- **Scopo:** acquisizione, validazione, deduplicazione, D1-first, qualificazione, routing,
  follow-up, attribuzione, conversione e downstream Climbo.
- **Sistema proprietario:** RankEmpire/TROVATEMI secondo il tipo di lead; contratti in
  `trovatemi-os` e stato operativo in D1.
- **Fonte canonica:** contratti/modelli approvati e record D1.
- **Input:** evento lead, consenso/provenienza, asset, canale e attributi di deduplica.
- **Output:** lead/opportunity aggiornato, routing, follow-up e audit trail.
- **Runtime compatibili:** Workers, Queues, Workflows, Hermes e agenti autorizzati.
- **Agenti autorizzati:** servizi e agenti con scope per fase e record.
- **Operazioni consentite:** validare, deduplicare, registrare, qualificare e proporre conversioni.
- **Gate umano:** Opportunity → Client, asset → Renter, promesse e operazioni irreversibili.
- **Log richiesto:** correlation/idempotency key, provenienza, transizioni, errori/retry e attore.
- **Disponibilità/maturità:** parzialmente disponibile e in sviluppo.
- **Verifica adapter:** contratti, workflow e integrazioni non verificati in questo task.

## `executive-operations`

- **Scopo:** brief mattutino, priorità, anomalie, stato sistemi, task, PR/CI, prossime azioni e
  registrazione di decisioni/promesse approvate.
- **Sistema proprietario:** Soliwkr per routing cross-project; ogni business conserva il proprio
  stato e le proprie decisioni.
- **Fonte canonica:** registry Soliwkr più fonti autorizzate dei sistemi proprietari.
- **Input:** priorità, eventi, health, task, PR/CI e decisioni approvate.
- **Output:** brief, alert, draft task e proposte con link alle fonti.
- **Runtime compatibili:** Hermes in futuro; Codex e Claude per esecuzione supervisionata.
- **Agenti autorizzati:** assistente esecutivo con accessi read-first e scope espliciti.
- **Operazioni consentite:** leggere, confrontare, monitorare, preparare e registrare soltanto
  decisioni già approvate.
- **Gate umano:** decisioni, promesse, messaggi sensibili, scritture normative e irreversibili.
- **Log richiesto:** fonti consultate, timestamp, anomalie, proposte, approvazioni e azioni.
- **Disponibilità/maturità:** sperimentale e parziale; runtime Hermes pianificato.
- **Verifica adapter:** artefatti legacy presenti nel checkout; operatività esterna non verificata.

## `operate-esim-product`

- **Scopo:** sviluppo e operatività del prodotto Senzaroaming.
- **Sistema proprietario:** `soliwkr/esim`.
- **Fonte canonica:** documenti e contratti del repository eSIM.
- **Input:** roadmap, stato, architettura, decisioni, dati SEO/editoriali e osservabilità autorizzata.
- **Output:** analisi, task, draft, implementazioni e verifiche nel repository proprietario.
- **Runtime compatibili:** Codex, Claude e futuri agenti autorizzati.
- **Agenti autorizzati:** agenti incaricati da Chris con accesso esplicito al repository eSIM.
- **Operazioni consentite:** leggere, analizzare, preparare e implementare modifiche autorizzate
  esclusivamente in `soliwkr/esim`; questa PR registra la capability senza implementarla o copiarla.
- **Gate umano:** strategia, pricing, promesse, pubblicazione editoriale, deploy pubblico quando
  previsto e operazioni irreversibili.
- **Log richiesto:** branch, commit, PR, fonti consultate, verifiche e approvazioni.
- **Disponibilità/maturità:** esistente e in sviluppo attivo.
- **Verifica adapter:** non verificato in questo task.
