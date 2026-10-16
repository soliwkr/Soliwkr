# SOLIWKR LIFE OS — MASTER DESIGN V2
**Stato:** PROPOSTA / PLANNING ONLY · Non modifica la costituzione, non autorizza deploy o accesso a dati personali.
**Data di ricognizione:** 2026-10-12 · **Owner e decision maker:** Chris
**Dominio:** Operator & Portfolio AIOS, non business OS dei singoli asset.
**Repo di implementazione esistente:** soliwkr/Soliwkr, Cloudflare Life Control Room.
**Provenienza:** AGENTS.md; governance/source-of-truth.md; governance/development-canon.md; PR #7 → #8 → #10 → #11 → #12; Andrej Karpathy, LLM Wiki (gist 442a6bf555914893e9891c11519de94f); documentazione Obsidian e Cloudflare citata più sotto.

## REVISIONE VINCOLANTE — ZERO INPUT (2026-10-12)

**Il proprietario non deve alimentare il Life OS manualmente.** La progettazione originaria parlava troppo di «scegli», «scrivi», «consolida», «compila» e «importa ZIP»: sono fallback facoltativi, NON il percorso primario. Il prodotto deve osservare **fonti già utilizzate**, con autorizzazioni e scope minimi, e compilare automaticamente fatti, eventi, stato e **bozze** di collegamenti. Il lavoro umano ordinario è vivere e operare altrove; nel Life OS serve solo decidere occasionalmente su una proposta importante o approvare un accesso.

**Fonte normativa per questa correzione progettuale:** [ZERO-INPUT-ARCHITECTURE.md](ZERO-INPUT-ARCHITECTURE.md). In caso di conflitto con qualunque flusso di data entry nel presente documento, prevale la specifica zero-input. Nessun token ChatGPT/Gmail/Calendar già connesso nel prodotto ChatGPT è automaticamente riutilizzabile nel Worker Cloudflare. Non dichiarare ingest delle chat ChatGPT senza un'integrazione ufficiale implementata.

**Roadmap corretta:** G0 Hardening → G1 ingestion GitHub+Cloudflare senza input manuale → G2 business receipts → G3 calendar read-only opt-in → G4 wiki agent con source-backed diff → G5 Jarvis. Il precedente piano con nuova UI prima dell'ingest è declassato a opzione successiva, non milestone principale.

## 0. Una tesi, non una raccolta di widget

**Un unico ingresso. Stanze distinte. Intelligenza invisibile. Libertà di uscire.**

SOLIWKR Life OS è uno studio personale per ricordare, scegliere, agire e riflettere, non un dashboard che misura il valore umano. La misura del successo: una persona apre il prodotto, capisce ciò che conta adesso, ritrova il contesto giusto e chiude il browser con meno rumore mentale di prima.

Domande a cui il sistema deve rispondere:
1. Che cosa conta ORA, considerando i miei impegni reali e il contesto che ho autorizzato?
2. Che cosa ho imparato, deciso e promesso? Dove sta la prova?
3. Che cosa è cambiato nei progetti e che cosa merita un intervento?
4. Quale collegamento non avevo notato, e quali fonti lo giustificano?
5. Che cosa posso delegare, rimandare, lasciare andare? Posso annullare un'azione?

Principio UX: **la home non è un inventario completo dell'esistenza**. Una sola scheda primaria e pochi accessi alle stanze. Nessuna parete di contatori; nessuno streak colpevolizzante.

## 1. Stato attuale verificato e verità scomode

Al 2026-10-12 la Control Room ha un Worker Cloudflare pubblicato su aios.soliwkr.pro, Access davanti, D1 personale, sette stanze (Oggi/Vita/Studio/Cervello/Atlante/Rituali/Connessioni), grafo strutturale SVG, knowledge cards approvate dall'utente, ZIP per Obsidian e CLI offline Ingest/Query/Lint. Il codice attuale è su una catena di PR aperte: #7, #8, #10, #11, #12; i test di contratto GitHub dell'ultima branch risultano PASS. **L'operativo pubblico non equivale a main**: il codice di Life Room non è ancora integrato nella branch canonica. Il test completo Android autenticato, il restore del DB, l'import Obsidian su dispositivo reale e l'eventuale sync restano gate NON SUPERATI. Non inventare risultati.

Debito tecnico attuale (priorità di sicurezza/affidabilità):
- **P0 / JWT:** il Worker accetta la presenza dell'header cf-access-jwt-assertion ma non verifica firma, issuer, audience, scadenza. Cloudflare dice espressamente che la verifica dell'header da sola non è sufficiente. Finché il perimetro Access protegge il custom domain, l'esposizione è mitigata, MA il controllo nel codice è insufficiente come difesa in profondità e rischia di rompersi con futuri accessi/API e alias. Portare verifica cryptografica con JWKS e jose su tutte le rotte private.
- **P0 / Source code e ambiente:** versioni Worker distribuite direttamente da branch PR non mergiate, nessuna strategia codificata di staging→production/rollback o drift check GitHub↔Cloudflare. Prima mettere ordine nella catena, non aggiungere funzionalità alla cieca.
- **P0 / Disaster recovery:** non è dimostrato un restore da backup D1 e una ricostruzione da file esportati. Un export ZIP non equivale a backup consistente, né a Obsidian Sync.
- **P1 / Datastore:** focus, fino a tre task e una inbox massima di 30 note sono conservati in un unico payload JSON con cap 40KB e version lock globale. Questo può produrre conflitti tra dispositivi e perdita di storia per troncamento/rotazione; non è un journal temporale affidabile.
- **P1 / Knowledge:** solo le note correnti in inbox possono essere promosse; l'originale copiato in knowledge_sources è preservato, ma l'inbox con 30 note è effimera e il legame tra note/carte necessita lifecycle, tombstone ed eventi coerenti.
- **P1 / UX frontend:** oltre 40KB di HTML con script inline e iniezione string-based (injectAtlas / injectMemory), CSP unsafe-inline, niente component library/test di comportamento reale. Codice poco scalabile, da migrare alla base ufficiale.
- **P1 / Grafo:** attualmente strutturale/manuale, nodo memoria fino a sei, layout hard-coded; non rappresenta evidenze, archi di contraddizione o temporalità. Il nome "knowledge graph" è ancora più ambizioso del suo modello.
- **P1 / Offline agent:** la CLI attuale importa una singola fonte come bozza, cerca parole e controlla link; NON esegue sintesi LLM persistente completa, NON si sincronizza con il server.
- **P2 / Obsidian:** ZIP privato non cifrato dopo il download; un'eventuale cancellazione D1 non cancella copie già scaricate. Serve controllo granulare su export, retention e privacy.

Decisione proposta: **prima stabilizzare e proteggere, poi evolvere**. Non proporre altre integrazioni prima di superare Gate 0.

## 2. Architettura dell'esperienza: una casa con sette stanze

### 2.1 OGGI — 15 secondi per ritrovare il centro

Scena: saluto discreto, data; una singola priorità editabile (non un grande dashboard); le tre mosse; un piccolo spazio "non fare" e tre porte contestuali. Se calendar reale è collegato, mostra il prossimo impegno con fonte e ora. Altrimenti NESSUN falso calendario o riempitivo.

Stati: "inizia con una", "azione in corso", "chiusa" e "oggi mi fermo". Alla mezzanotte locale non eliminare nulla e non azzerare arbitrariamente; proporre un rollover esplicito, archiviando il giorno precedente. Le attività non finite NON passano automaticamente al giorno successivo.

**Delight:** premendo completato, una micro-animazione e un messaggio sobrio, poi fine. Non vuole un altro punteggio.

### 2.2 VITA — domini, non KPI

Sei stanze self-report: Corpo ed energia; Relazioni e famiglia; Fede/interiorità; Denaro e stabilità personale; Lavoro e creazione; Tempo e casa. Ciascuna ha un piccolo spazio: "come la percepisco", "un passo", "una cosa per cui sono grato", possibilità di non compilare. La storia è mostrata come sequenza temporale di dichiarazioni con date, non linea statistica diagnostica. Non fare analisi cliniche o spirituali automatiche. Non acquisire dati di familiari senza scopo e consenso appropriati.

**Delight:** puoi scegliere di nascondere un'area dalla home senza cancellarla; i progetti non invadono automaticamente l'area Famiglia.

### 2.3 STUDIO — operations e portfolio senza teatro

Portfolio come libreria di sistemi e "stanze" dei business, NON elenco di 20 repo e ultime push spacciate per avanzamento. Scheda: owner, fonte autorevole, stato di connessione, ultimo segnale verificabile, blocco attivo, prossimo gate, qualità/freschezza della prova; apri la fonte originale. Views: Attivi, Esperimenti, In pausa, Da verificare. Filtri e ricerca.

Business metrics: solo da Black Office/provid­er corretti, timestamp e definizione. Repository GitHub possiede codice e issue, NON ricavi. Climbo/Trovatemi mantiene i propri contratti. Un semaforo giallo può significare "dati stantii", mai "azienda in crisi" per inferenza.

**Delight:** invece di "n progetti attivi", una riga "solo 1 sistema richiede una tua decisione, gli altri possono aspettare" se e solo se basata su segnali espliciti.

### 2.4 CERVELLO — ingresso istantaneo, lettura calma

Tre sezioni, non un unico modulo: (A) Cattura grezza testo/voce/allegato in futuro, senza obbligo di classificare; (B) Inbox con provenienza e archiviazione non distruttiva; (C) Memoria: fatto dichiarato, decisione, lezione, domanda, ipotesi, e stato revisione. L'utente può ritirare/correggere una carta. Nessuna promozione automatica di una nota in "verità su di me".

**Delight:** "ricordi quando..." soltanto con un'ancora di fonte visibile e tasto "questo non è più vero".

### 2.5 ATLANTE — grafo epistemico, non wallpaper

Modalità: "Vicino a me", "Progetti", "Idee", "Decisioni", "Nel tempo". Mostrare come default un grafo locale a 1 hop + percorso di esplorazione, non una galassia di 400 punti. Search-first e dettagli a destra/nel bottom sheet mobile.

Ciascun nodo ha: tipo, ID stabile, etichetta, origine proprietaria, data osservazione, livello privacy, stato revisione e fonte apribile. Ciascun arco ha: tipo (belongs_to, relates_to, supports, contradicts, supersedes, depends_on), provenienza, author (user/agent/import), stato PROPOSTO/APPROVATO/RIFIUTATO e validità temporale. L'arco senza prova può apparire solo in un layer "Ipotesi proposte", mai come fatto nel grafo canonico.

**Delight:** la domanda utile non è "quanti nodi?" ma "quali due decisioni sono collegate dalla stessa fonte e non lo avevo notato?". Le proposte di collegamento devono mostrare un confronto fonte-a-fonte verificabile e un bottone rifiuta.

### 2.6 RITUALI — apertura e chiusura senza sorveglianza

Mattino: scelta focus e rinuncia. Sera: tre domande brevi, con salvataggio nel journal e opzione "salta"; settimanale: lettera a te stesso con fatti e note approvate. Nessun streak predefinito, nessun messaggio che attribuisce scarso valore umano a bassa produttività.

**Delight:** la settimana si conclude con ciò che è cambiato e ciò che puoi lasciare indietro, non una percentuale di esistenza completata.

### 2.7 CONNESSIONI — trasparenza sulle fonti

Ogni integrazione mostra: provider, dominio/owner, privilegi (read/write), data ultimo sync, ultimo errore, campi disponibili, revoca e link alla sorgente. "Non collegato" e "sconosciuto" sono diversi da 0. Scope sensibile e accesso a Gmail/Calendar/Drive devono essere espliciti.

### Overlay JARVIS — non un'ottava stanza

Comando universale Cmd/Ctrl+K desktop o pulsante mobile. Intents separati:
- cerca nella wiki;
- cattura;
- mostrami il contesto di una decisione;
- proponi due priorità basate su fonti;
- prepara un'azione in DRAFT;
- esegui un'azione SOLO se permission, scope, budget e gate umano lo permettono.

Jarvis è un'interfaccia/agent, **non il proprietario della memoria né delle regole**.

## 3. Journey verificabili

**Mattina senza tempo:** apri in 3s → vedi data e focus → scegli 1 mossa → esci in <=30s. Se calendario non è collegato, zero card finta.

**Nuova idea:** premi cattura → scrivi → salva in <=10s e torna alla stanza precedente. La voce è futura e opt-in.

**Domanda nel tempo:** cerchi "perché ho interrotto quel progetto" → wiki con decisione, fonte, data e collegamenti. Se la fonte manca, risposta "non risulta ancora registrato" e opzione ricerca/salvataggio.

**Connessione tra progetti:** Atlante propone due nodi, mostra due fonti e un tipo di relazione; puoi approvare, correggere, rifiutare. Rifiuto impedisce che identica proposta continui a ricomparire senza nuovi fatti.

**Momento personale delicato:** in Vita puoi scrivere senza creare task, senza analisi automatica, senza invio a un LLM e senza attribuire etichette ad altre persone.

**Fine giornata:** una piccola revisione che archivia il contesto, non fa reset arbitrari. Puoi chiudere senza compilare nulla.

## 4. Contratto dei dati: prima prove, poi memoria, poi grafi

### 4.1 Layer autorevoli e immutabilità relativa

- **Origini esterne:** Google Calendar/Gmail/Drive, GitHub, Stripe, Cloudflare, Black Office etc. restano autorevoli per il loro dominio. Il Life OS legge e salva puntatori, timestamps e snapshot esplicitamente autorizzati, non riprende possesso di dati altrui.
- **Origini personali:** quick notes, decisioni approvate, diario e preferenze appartengono al private datastore Life OS.
- **Wiki:** pagine generate e curate localmente dagli agenti con revisione; restano Markdown portabili. Obsidian è la UX locale, non l'autorità normativa cross-project.
- **Cache e proiezioni:** grafo visuale, brief, riepiloghi e suggerimenti sono sempre derivati e ricostruibili.
- **Eventi:** scritture importanti sono versionate e auditabili, con tombstone e revoche. Raw immutable significa "agente non riscrive"; l'utente mantiene diritto alla correzione e alla cancellazione intenzionale.

### 4.2 Schema logico V2 (non migrazione già applicata)

| Entità | Colonne chiave | Invariante |
| --- | --- | --- |
| sources | id, owner_domain, external_ref, content_hash, observed_at, occurred_at, sensitivity, retention, access_scope | Ogni evidenza ha origine e timestamp |
| notes | id, body_ref, source_id, created_at, edited_at, archived_at, privacy | Non cap 30 e non reset su mezzanotte |
| claims | id, text, kind, status, asserted_by, source_id, version, valid_from, valid_to | Non confondere dichiarazione e prova esterna |
| evidence_links | claim_id, source_id, excerpt_ref, locator, direction, review_status | Citazione recuperabile, niente grafi basati su vibes |
| graph_nodes | id, canonical_ref, type, label, source_id, privacy, version | ID stabile, dedup su canonical ref |
| graph_edges | from_id, to_id, predicate, source_id, review_status, asserted_by, valid_from, valid_to | Nessun arco canonico senza fonte/owner o approvazione |
| decisions | id, question, options_ref, chosen, reason_ref, decision_at, scope, owner | Le decisioni normative restano nella fonte del dominio |
| daily_sessions | local_day, zone, focus_ref, status, closed_at | Rollover idempotente; nessuna cancellazione automatica |
| tasks | id, session_id, text, status, created_at, completed_at, origin_ref | Da/verso giorno solo con scelta |
| proposals | id, input_source_ids, output_diff_ref, risk, confidence_label, status, requested_scope | Nessuna proposta auto-promossa |
| integrations | provider, granted_scopes, checked_at, freshness_ttl, error_code, revoked_at | Connettore read-only di default |
| audit_events | event_id, operation, actor, target_type, target_id, timestamp, result, request_id | Audit senza raw sensibile nei log |
| sync_manifests | export_id, cursor, source_versions, hash_manifest, generated_at, device_ref | Sync incrementale reversibile |

Non committare contenuti reali. La definizione concreta richiede ADR D1 per costi, cardinalità, transaction semantics, foreign keys e test migration-up/rollback.

### 4.3 Esempio di epistemologia

Una nota "Voglio investire più tempo in X" è **intenzione dichiarata**, non prova che la persona lo farà. La carta "Ho deciso X" è **decisione dell'utente**; l'esecuzione è un altro evento. Un post GitHub può essere un **segnale di attività tecnica** e non prova di traffico o revenue. Un collegamento fra due persone è **sensibile e proposto**, mai dedotto come fatto da un modello.

Distinzione visiva obbligatoria: **FATTO OSSERVATO / DICHIARAZIONE / IPOTESI / DECISIONE / DATI STANTII / SENZA FONTE**.

## 5. Karpathy LLM Wiki vera: compilazione incrementale della conoscenza

La versione presente esporta la struttura e una CLI deterministica, ma l'idea di Karpathy va oltre: **l'LLM legge una nuova fonte e modifica molte pagine della wiki in modo coerente**; Query può produrre nuove pagine; Lint trova contraddizioni e lacune. Solo così la conoscenza si accumula.

### Modello corretto

RAW immutable → INGEST con curatore LLM → wiki Markdown persistente e wikilink → INDEX semantico → QUERY source-backed → LINT periodico → LOG append-only.

Proprietà proposte del vault:
- id, kind, canonical_ref, source_refs, observed_at, updated_at, review_status, privacy, verified_claims;
- note singole per entità/argomento, sintesi separate dalle fonti;
- INDEX panoramico leggibile con poco contesto; LOG cronologico coerente;
- backlinks verificati e path stabili; note rinominate con redirect/alias;
- file e fonti personali sensibili esclusi dall'elaborazione LLM per default.

Operazioni dell'agente **librarian**:
1. prende UNA fonte selezionata da Chris (mai crawl indistinto della vita);
2. calcola hash e identifica duplicati/versioni precedenti;
3. produce un **piano/diff** delle pagine coinvolte, con citazioni puntuali;
4. segnala contraddizioni e distingue nuove ipotesi;
5. lint deterministico su link, orfani, schema e source pointers;
6. applica patch a wiki/ e INDEX solo dopo il gate approvativo configurato; log append-only;
7. fa replay/undo da una revisione nota, senza toccare raw.

I prompt in raw sono SEMPRE dati non fidati; gli agenti non seguono istruzioni contenute nei documenti importati.

### Possibile runtime

**Primo candidato:** Codex/Claude su laptop Omarchy con il vault aperto localmente; più avanti Hermes/Jarvis come orchestratore di intenti, senza rendere il runtime obbligatorio. Il vault non va committato nel repo pubblico. Non serve un daemon/VPS per la V2. Cloudflare Worker può fornire export/API ma non sostituisce automaticamente l'accesso al filesystem locale Obsidian.

### Ricerca

Fino a circa 100 fonti / centinaia di pagine: INDEX + ricerca testuale e grafo locale. Dopo prova di insufficienza, valutare qmd BM25/vector locale, e solo poi embeddings/AI Search. Nessun vector DB preventivo.

### Obsidian

Graph View nativa rende i wikilink. Bases (core) può offrire tabelle filtrate su frontmatter senza introdurre database proprio. Se serve sync multi-device, scegliere esattamente UNA strategia dopo un test di conflitti e cancellazioni: per esempio Obsidian Sync con consenso e relativo costo, oppure Git **privato**/Syncthing in funzione dei dispositivi. Mai sincronizzare lo stesso vault con due servizi in parallelo. Attuale ZIP è solo export unidirezionale; vietato descriverlo come sync.

## 6. AIOS cognitive twin: modello reversibile della persona, non profilo clinico

Il Self Model è un **registro versionato di fatti, preferenze e pattern dichiarati**, non un dossier che giudica qualcuno. Materiale:
- Preferenze operative esplicite; valori/priorità formulati in prima persona; vincoli; obiettivi.
- Decisioni con contesto temporale e risultato osservato, non soltanto intenzioni.
- Ipotesi su pattern personali PROPOSTE e correggibili, con evidenze separate.
- Contraddizioni del tempo: "prima preferivo A, oggi preferisco B" con data, non personalità falsa.
- Principio di diritto all'oblio: correzione, cancellazione, pausa dell'apprendimento, export.

Una "memoria intelligente" funziona perché sa dire **non lo so**. Richieste su familiari e altri soggetti richiedono privacy minima; nessuna diagnosi e nessun tracking occulto.

### Livelli di sensibilità

P0 pubblico: nomi/URL di repository pubblici e governance non sensibile.
P1 privato: task, appunti di lavoro, note sul sé.
P2 intimo: salute, fede, relazioni, finanze familiari, materiale di terzi → opt-in separato per export e invio a LLM.
P3 secret: password, chiavi, token, credenziali → vietati nei raw/wiki e nella messaggistica; usare secret manager.

Default: nessuna sintesi cloud del materiale P2 e niente export "tutto" non selettivo. Proteggere anche file già scaricati: i download sono copie fuori controllo server e non sono revocabili a posteriori.

## 7. Tecnologia: scegliere una base affidabile, non iterare stringhe HTML per sempre

### Starter Gate ADR-001 (proposto)

**Scelta consigliata:** Cloudflare official React SPA starter (React + Vite + Workers API), con TypeScript, Static Assets, D1. Repository: cloudflare/templates/react-starter-template; reference commit del catalogo al 2026-09-22: 47645c985c10aa8afc2f837b983a3678a36a60cb.

**Perché SPA:** tutto dietro Access, nessuna esigenza SEO/SSR, uso quotidiano da smartphone; separa UI dai moduli API; compatibile con sviluppo locale e test browser. Valutata alternativa Cloudflare React Router v8 SSR full-stack: solida, ma ora più complessa del necessario per una cabina privata. Conservare dominio e DB, parallel preview isolata, migrazione strangler endpoint-by-endpoint.

Grafo: @xyflow/react (React Flow) MIT, con viewport, keyboard, selectable nodes/edges e zoom; sostituire SVG manuale quando il modello edges con evidence è testato. Layout automatico solo se una libreria adatta porta valore verificato. React Flow è un renderer, mai il sistema di verità.

UI: Design tokens attuali e componenti accessibili; niente dipendenza dalla pagina monolitica e dalle iniezioni string-based. Preferire 3 livelli: glance, exploration, action. Palette home si riduce a 5 spazi principali, Connessioni/rituali contestuali; una sola schermata attiva per volta. Ottimo on mobile 360px.

Backend: Worker con moduli TypeScript, repository/dao D1, policy engine deterministico, validated schemas, source adapter read-only. Per file grandi R2 **solo se necessario**, con retention e accesso definito. Per job durevoli scegliere Cloudflare Queues/Workflows **solo dopo** che c'è un vero trigger. Nessuna VPS, Kafka, vector DB o scheduler come prerequisito.

### Identity e Security (P0)

- Verificare criptograficamente JWT Cloudflare Access con JWKS, issuer e audience come da documentazione ufficiale (jose oppure WebCrypto), oltre alla policy Access del dominio. Trattare "header presente" come NON autenticato.
- Autorizzare actor, owner e scope per ogni endpoint; default-deny, incluso GET di export e file sensibili.
- CSP senza unsafe-inline nella nuova SPA, escape e sanitizzazione dei file Markdown/HTML; no script eseguibili da appunti o fonti importate.
- CSRF same-origin + token appropriato, CORS stretto, headers, rate-limits e limiti query/export; test di abuso/zip bomb e symlink/path traversal nel vault locale.
- Audit minimale (request_id, operation, target, outcome) SENZA loggare corpo delle note, cookie o JWT.
- Recupero: procedure D1 backup e **restore testato** con snapshot non-prod, confronto checksum e abort su conflitto.
- GDPR e dati sensibili: non equiparare automaticamente "D1 EU" a garanzia totale di residenza, backup/log e subprocessor. Eseguire check sulle regioni effettive e policies prima di fare affermazioni.
- Proteggere l'ambiente preview: non usare D1 di produzione né autenticazione permissiva in una preview esposta.

### Integrazioni

Adapter contract: system_key, owner_domain, source_type, read_scopes, sync_cursor, last_verified_at, freshness_ttl, locator, source_hash, error_code e consent_ref. Prima read-only per GitHub, Calendar, e segnalazioni selezionate; poi altri. Stripe ed economia: Black Office / provider canonico, mai duplicazione di stato come verità. Gmail/Drive solo con permessi espliciti e trattamento di dati di terzi. Ogni adapter deve avere unlink/revoke e test per provider 401/403/429/5xx.

## 8. Jarvis: un suggeritore che conosce i propri limiti

Separare tre ruoli:
- **Librarian**: controlla fonti, prepara pagine wiki e diff, non esegue azioni esterne.
- **Analyst**: confronta progetti/decisioni, segnala evidenze, staleness e alternative; non modifica fonti normative.
- **Executor**: esegue workflow deterministici AUTORIZZATI, con scope, budget, idempotency key, audit e possibilità di rollback.

Prima di qualsiasi effetto esterno: INTENT → PLAN → POLICY CHECK → PREVIEW → HUMAN GATE (quando obbligatorio) → EXECUTE → RECEIPT → REVIEW. Un'azione che invia mail/WhatsApp, spende denaro, modifica contratto o elimina dati è sempre protetta dal gate umano e dalla costituzione dei singoli domini.

Usare LLM per suggerimenti, scrittura e sintesi source-backed; codice deterministico per autorizzazioni, budget, contatori, policy e idempotenza. Non affidare a JEV/LLM il potere di superare gate.

## 9. Telemetria di qualità (mai uno score personale)

Product analytics locali aggregati e minimizzati:
- time-to-first-action dal momento dell'apertura: target p50 <= 25s in test controllato;
- capture-without-friction: p50 <= 10s;
- 5 task di navigazione su Android completati senza spiegazioni da 5 sessioni test (il campione piccolo non prova generalizzabilità);
- zero edit perduti, incluse due tab/dispositivi;
- zero accessi privati con JWT non valido;
- 100% degli archi canonici con origine/revisione, 100% delle risposte wiki con citation pointer;
- zero modifiche dei file raw da agent;
- pass completo export Obsidian → open Graph View → export repeat → diff e dup test;
- nessun KPI sulla qualità morale/spirituale o il valore della persona.

Business metrics, se mai presenti, devono venire dai proprietari di dominio con definizione, timestamp e staleness. Nessun "0 euro" al posto di "non collegato".

## 10. Milestone, gate numerici e criteri KILL

### G0 — HARDENING / UNBLOCK (prima di qualunque altra feature)
Scope: spezzare la catena #7/#8/#10/#11/#12 in piano di integrazione Git→production, firma JWT, environment isolation, restore, test privacy, smoke Android.
GO: 100% accessi non validi → 401/403; 0 dati privati in test/preview/log; 0 migrazioni distruttive; 100% endpoint sensibili protetti; restore completo di una copia test senza perdita; 0 regressioni su state V0/V1. ITERATE su difetti recuperabili; KILL del rollout con un singolo leak di dati o bypass auth.
**Non cancellare o chiudere PR preesistenti in automatico**.

### G1 — PRODUCT FOUNDATION
Nuova SPA Cloudflare ufficiale in preview isolata, design tokens, shell, 7 viste, keyboard/mobile, eventi giornalieri persistenti, error boundary, test browser.
GO: i 5 flow critici funzionano da Android, p50 focus <=25s, cattura <=10s, 0 perdite dati a doppia tab; parity con V1.4 e rollback documentato. ITERATE su UX friction; KILL del replatform se raddoppia il carico operativo senza guadagni misurabili.

### G2 — SOURCE-AWARE MEMORY
Claims tipizzate, evidence links, grafo D1 con apposite query, User-approved edges, source manifest e cancellazioni/tombstone. Migliorare export con selezione dati P1/P2 e ID stabili.
GO: 100% new edges source-backed o contrassegnati come draft; 0 deduplicazioni distruttive; corpus fixture con >=30 fonti e >=100 nodi coerente dopo ingest/query/lint; 0 archi falsamente approvati. ITERATE su staleness/duplicati.

### G3 — KARPATHY LOOP REALE
Vault locale privato con agente autorizzato, un-source-at-a-time, delta-patch e preview, lint e index/log. Nessun polling di nascosto.
GO: su fixture di >=25 fonti, 100% raw immutati per hash, >=95% wikilink risolti, 100% sintesi con fonte; contraddizioni note segnalate, nessuna promozione delle bozze senza consenso. Se il curatore allucina senza citazioni, fallback a CLI deterministica.

### G4 — VERIFIED EXTERNAL SIGNALS
Read-only connector per un provider alla volta; freshness policies, disconnect, test 401/403/429; Calendar o GitHub prima, Stripe solo con definizioni Black Office.
GO: 100% delle card live con source+timestamp; provider stantio → UNKNOWN; 0 scritture a terzi, 0 scopes superflui, revoca efficace. Rinviare Gmail se trattamento dei dati di terzi non approvato.

### G5 — JARVIS WITH GOVERNANCE
Proposte contestuali con diff, receipts, nessuna autonomia cieca.
GO: 100% delle azioni esterne con policy-gate conforme, log e richiesta approvativa; 0 azioni irreversibili automatiche; riduzione misurabile delle operazioni ripetitive senza nuove sorprese.

Le durate dipendono da autorizzazioni, collaudi reali e complessità; nessuna promessa di "tutto pronto domani". L'infrastruttura resta Cloudflare-first senza nuova VPS predefinita e con budget esterno zero finché non c'è un esperimento approvato.

## 11. Sequenza di lavoro immediata e dependency map

**Pacchetto A — affidabilità:** inventory completo degli endpoint; JWT verification proof; test cookie/Access, migration backup/restore rehearsal, smoke Android, staging D1, deployment CI riproducibile; prima dei redesign invasivi.

**Pacchetto B — domain modeling:** schema e contratti con JSON examples fittizi, ownership, path stabili, privacy model, provenance, dedup, valid_from/superseded_by, erase/export semantics; unit test.

**Pacchetto C — UX shell:** design system riusabile, starter ufficiale Cloudflare, screen prototypes di Oggi, Cervello, Atlante, test mobile + reduced motion; migrazione a feature flag, non big-bang.

**Pacchetto D — wiki:** bundle CLI e specifica agente/diff, Obsidian Bases, source-aware lint. Sync bidirezionale vietato fino al contratto di merge/cancellazione.

**Pacchetto E — live data:** registry adattatori verificati, una connessione read-only; policy per freshness e ownership.

**Pacchetto F — governance runtime:** intent, simulazione, approval queue, deterministic receipts, integration con agenti esistenti come interfacce sostituibili.

Prima PR attuativa raccomandata: **P0-JWT-AND-RELEASE**. Non iniziare da un nuovo grafo o da altri widget. Scegliere il path di merge coerente, proteggere dati e costruire staging. In questa specifica non viene eseguito nessun deploy.

## 12. Decisioni pendenti (richiedono approvazione umana)

D-01: Canonizzare Life OS V2 come direzione di prodotto e leggere/correggere i confini con il self-model.
D-02: Consentire all'agente locale di leggere le note P1? P2 richiede opt-in separato, preferibilmente per file/folder.
D-03: Scegliere se il vault Obsidian locale sia il master delle note wiki curate; D1 rimane master di cattura/journal. Vietare dual-master automatico per lo stesso record.
D-04: Confermare il costo/servizio di sync, se necessario. Nessuna nuova subscription implicita.
D-05: Accettare Starter Gate React SPA + React Flow solo dopo parity gate e conferma tecnica finale.
D-06: Coordinare ordine di integrazione delle PR esistenti senza merge automatico.

## 13. Risorse primarie / riferimenti

- Soliwkr costituzione: https://github.com/soliwkr/Soliwkr/blob/main/AGENTS.md
- Karpathy LLM Wiki: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
- Cloudflare React SPA official: https://github.com/cloudflare/templates/tree/main/react-starter-template
- Cloudflare React Router full stack: https://developers.cloudflare.com/workers/framework-guides/web-apps/react-router/
- React Flow: https://reactflow.dev/learn
- Obsidian Graph: https://obsidian.md/help/plugins/graph
- Obsidian Bases: https://obsidian.md/help/bases
- Obsidian sync: https://obsidian.md/help/sync-notes
- Cloudflare Access verify JWT: https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/

**Affermazione finale:** una vita umana non può essere ridotta a un database completo. Il prodotto deve rendere più facile orientarsi e ricordare senza rivendicare una conoscenza totale della persona.
