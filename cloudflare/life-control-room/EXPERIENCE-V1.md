# LIFE CONTROL ROOM — Experience V1 / prodotto e roadmap

**Stato:** V1 implementata su branch `feat/life-room-v1-navigation` (prima del gate finale).  
**Owner:** Chris · **Repository:** `soliwkr/Soliwkr` · **Runtime:** `soliwkr-life-room` / `aios.soliwkr.pro`  
**Fonte normativa:** `AGENTS.md`, `governance/source-of-truth.md`.

## Decisione di prodotto

**Una sola porta, non una sola schermata.** Un “life cockpit” non è un muro di widget. La home risponde a una domanda, il resto vive in stanze raggiungibili con un gesto. Ogni ingresso offre un'azione ovvia e nessun KPI inventato.

Il benchmark NON è “quante integrazioni appaiono”, ma “quanto facilmente Chris trova ciò di cui ha bisogno, prende una decisione e torna a vivere”.

### Architettura dell'informazione

| Stanza | Domanda | Azione primaria | Source of truth |
| --- | --- | --- | --- |
| Oggi | Cosa conta *adesso*? | Scrivi una priorità / fino a 3 mosse | D1 personale |
| Vita | Di quale parte della vita mi devo occupare? | Esamina una delle 6 aree e sceglie un passo | D1 personale / self-report |
| Studio | A cosa sto dedicando energie? | Vai al progetto e alla sua fonte | Repos GitHub (attività) / BO (economia) |
| Cervello | Che cosa posso liberare dalla testa? | Cattura nota senza classificare | D1 personale |
| Rituali | Come apro e chiudo la giornata? | Scelta mattutina, nota serale, una rinuncia | D1 personale |
| Connessioni | Quali informazioni sono reali? | Apri fonte; vedi stato dell'integrazione | Sistemi proprietari |

**Navigazione:** sidebar desktop; tab bar mobile con le prime cinque stanze; sezione Connessioni raggiungibile da sidebar desktop e da pagina Studio / menu in fase successiva. L'assenza di Connessioni nella tab bar mobile è un debito UX V1.

### Stile

Dark studio, contrasto tipografico ampio, molto spazio negativo, accenti lime/lavanda/corallo. Niente card a metrica finta. Transizioni leggere, riduzione animazioni in OS rispettata. No font esterni né tracking. `Ctrl/Cmd+K` per cattura rapida, bottoni espliciti su mobile.

### Compatibilità

Mantiene il contratto esistente `GET/PUT /api/state` (version lock), `GET /api/projects`, la forma JSON di `private_state`, la protezione Access e la giurisdizione D1 EU. I dati V0 vengono caricati senza migration distruttive. Nessun contenuto privato è nel repository o nel bundle.

## Piano di consegna

### V1 — Usabile senza confusione (ora)

1. Codice UI separato da runtime/API (moduli `src/experience.js`, `src/index.js`).
2. Home essenziale (una priorità, 3 mosse, progresso delle sole mosse).
3. Navigazione tra sei sezioni non simultanee, salvataggio e feedback reale.
4. Le sei aree Vita, cattura dal Cervello e dialogo `Cmd+K`.
5. Rituale mattino/sera e capacità di archiviare risposta in note.
6. Portfolio GitHub categorizzato *senza fingere fatturato*.
7. Test: parsing JS, API compatibilità, 390/1280 viewport, protezione Access, refresh e persistenza.

### V1.1 — Affidabilità di uso quotidiano

- `rollover` del giorno *esplicito*, non cancellazione automatica: archivia priorità/mosse del giorno precedente, nuova giornata vuota **solo dopo scelta umana**.
- Risoluzione conflitti multisessione con merge guidato anziché solo 409.
- Offline/connessione lenta: dati read-only con ultimo timestamp noto; mai illusione di salvataggio.
- UX pass mobile per raggiungere Connessioni, plus accessibility test (tab, focus, VoiceOver/TalkBack).
- Pipeline CI/CD GitHub→Cloudflare + test check in PR, rollback a versione precedente.

**Gate:** sul telefono, completare 5 azioni in <2 minuti senza spiegazioni: cambio stanza; focus; 3 mosse; cattura nota; refresh con dati persistenti. Zero perdite di dati durante navigazione, salvataggi concorrenti e session timeout.

### V2 — Una vista del mondo reale

Adapter server-side read-only, contratti per dominio, access control e audit. Priorità:
1. Google Calendar oggi (eventi reali) e Inbox Gmail *azioni che richiedono attenzione*; ChatGPT connector non equivale a un OAuth token nel Worker: serve una connessione web sicura dedicata.
2. Cloudflare Workers/Deploy salute tecnica; GitHub CI e issue oltre alle date di push; status operativo verificabile (mai “tutto verde” per default).
3. Stripe ↔ progetti con mappa account esplicita; Black Office economica resta autorevole per attribuzione e policy. Mostrare ricavo solo se fonte verificata e timestamp.
4. Drive: ricerca e riferimenti canonici, non duplicazione di dati.

**Gate:** ogni numero o attività ha source, owner, timestamp, staleness policy e link all'origine. Dati assenti = “non collegato”, non zero.

### V3 — Una vita che impara (con consenso)

- Self Model versionato, sotto controllo dell'utente: decisioni, pattern dichiarati, ipotesi separate dai fatti, possibilità di correggere ed esportare.
- Jarvis come *interfaccia per intenti e comandi* con permessi stretti, mai fonte canonica, mai motore che riscrive la persona.
- Rituali utili alla vita e al business: nessuna metrica di valore personale basata sulla produttività.

**Gate:** 100% delle scritture con fonte/autorizzazione/audit; possibilità di esportare e scollegare.

## Guardrail

- ZERO token, dati di salute, famiglia, denaro, credenziali e nomi di terzi nel GitHub pubblico.
- Cloudflare Access **obbligatorio** sul dominio e Worker non raggiungibile su workers.dev.
- Evitare invasione: le aree personali sono solo self-report, non score psicologici o religiosi.
- Source of truth invariato. Soliwkr UI rappresenta, non governa i domini business.
- Budget: mantenere CF-first senza introdurre VPS, nuove sottoscrizioni o API a pagamento senza gate.

## Rollback e misura

- Nessuna migration distruttiva V1. Se UI fallisce, ripristinare precedente versione Worker; D1 resta invariato.
- Test veri richiesti post-deploy: refresh autenticato, check note e task, viewport Android, persistenza D1, access denied senza session.
- Metriche di prodotto interne possibili: time-to-focus, completion of user-chosen actions, number of failed saves. Non usarle per giudicare il valore personale.
