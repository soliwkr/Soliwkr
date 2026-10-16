# LIFE OS V2 — ZERO-INPUT / OBSERVATIONAL AIOS
**Decisione di prodotto:** la persona non deve alimentare il sistema con moduli, task, note, titoli, categorizzazioni, aggiornamenti o stati. La progettazione precedente, centrata su «inserisci/compila/consolida», è superata. L'input intenzionale è **eccezione**, non flusso operativo.

**Stato:** specifica proposta, non è un adapter live né consenso all'accesso a dati sensibili. **Fonte della correzione:** feedback esplicito del proprietario, 2026-10-12. Vedi `MASTER-DESIGN.md`, `EXPERIENCE-SPEC.md`, `DELIVERY-GATES.md`.

## 1. Product contract: ZERO ENTRY, NON ZERO RESPONSABILITÀ

**Promessa:** «Io vivo, lavoro, decido e parlo nei luoghi che uso già. SOLIWKR osserva ciò che è collegato, ricostruisce il contesto e mi restituisce solo ciò che merita attenzione, con fonti. Non chiede che io ricopi il mio mondo».

- **Zero data entry** come condizione ordinaria: niente copia di email, chat, documenti o task; niente «segna come fatto», niente categorizzazioni necessarie alla qualità minima del sistema.
- **One-time connection/consent:** sono comunque necessari collegamenti OAuth, identità, verifica dei permessi e scelte di privacy. Non si possono connettere servizi senza azione dell'utente.
- **Zero false knowledge:** in assenza di una fonte, mostra «sconosciuto/non collegato», non deduce una vita completa da repository o email.
- **Exception human gates:** interpretazioni su valori/relazioni/salute, azioni esterne, contratti, spese e decisioni irreversibili hanno un controllo umano. Sono **microconferme**, non lavoro amministrativo quotidiano.
- **Silent by default:** nessuna «inbox da riempire», nessuna gamification obbligatoria. Una notifica soltanto quando è verificabile e azionabile.
- **No voyeurism:** ingest data-minimizing per scopo; non raccogliere conversazioni di terzi e materiale P2 in massa.

Una persona può ancora scrivere volontariamente, ma il prodotto NON deve dipendere dalla scrittura manuale.

## 2. La vera architettura — LIFE OS COME COMPILATORE DELLA REALTÀ

```text
 LE TRACCE CHE GIÀ ESCONO DALLE TUE ATTIVITÀ
   GitHub PR/issue/push · Cloudflare deploy/errors
   Calendar eventi · Gmail segnali selezionati · Drive documenti
   Black Office receipts/stati · altri Business OS
   Obsidian files (quando il vault è connesso)
   Messaggi intenzionali al sistema (solo canale supportato)
                       |
                       v
       CONNECTOR REGISTRY / CONSENT / SCOPES
       POLLING INCREMENTALE + WEBHOOK VERIFICATI
                       |
                       v
        RAW EVENT LEDGER (immutabile all'agente)
          actor · owner · source · event_time
          observed_at · idempotency · digest
          sensitivity · TTL · canonical_ref
                       |
                       v
           NORMALIZER DETERMINISTICO
         dedup · correlation IDs · lifecycle
         event → entity → state projection
                       |
                       v
           AI LIBRARIAN (solo dove utile)
      deduci proposte / NON inventare fatti
    claim type + citations + confidence label
                       |
                       v
         EPISTEMIC GRAPH / KARPATHY WIKI
        nodi, relazioni, versioni, citazioni
                 [draft | approved]
                       |
                       v
         PERSONAL BRIEF / STANZE / JARVIS
      «Questo è successo. Questo cambia.
          Qui serve una tua decisione.»
                       |
                       v
      APPROVAZIONE OCCASIONALE → RECEIPT
```

**Superfici utente** e **servizi sorgente** sono distinti: il Worker non possiede magicamente le autorizzazioni dei connector di ChatGPT. Un plugin connesso *dentro ChatGPT* non diventa un token OAuth riutilizzabile su Cloudflare. Serve un adapter dedicato con consenso, token server-side e scopes appropriati; in mancanza, segnare *non collegato*. Le conversazioni ChatGPT non hanno per definizione un webhook o accesso integrale da Cloudflare: servono funzionalità ufficiali supportate, un esportatore volontario oppure un canale chat progettato appositamente. **Non dichiarare «ascolto tutte le tue chat» senza implementazione verificata.**

## 3. Hierarchy delle fonti, senza ricopiare dati

| Classe | Fonti concrete | Metodo realistico | Cosa si può ricostruire | Cosa NON inferire |
| --- | --- | --- | --- | --- |
| DevOps | GitHub account/repos, Cloudflare Workers / logs / deploy | API read-only, webhook se autorizzato | PR, errori, release, issue, lavoro completato nel repository | Ricavi, valore personale, successo commerciale |
| Business | BLACK OFFICE, Stripe, Trovatemi/Climbo | API proprietaria con source map; receipts | Gate esperimenti, transazioni vere (se accessibili) | Qualità economica senza attribuzione e refund |
| Agenda | Google Calendar | OAuth read-only con scope minimo | appuntamenti, date reali, finestre temporali | Perché una persona sia stanca o quale relazione stia bene |
| Inbox | Gmail | OAuth consentito, ricerca mirata/metadata, non crawl integrale | impegni espliciti, fatture, richieste da triagiare | pensieri/affetti o priorità personali senza verifica |
| Documenti | Google Drive, repo markdown | Changes API, feed incrementale, metadata-first | nuove decisioni documentate, contratti da controllare | approvazione normativa da file non approvato |
| Conversazione | canale Jarvis da costruire, note volontarie, export esplicito ChatGPT | input diretto solo dove tecnicamente disponibile | decisioni dette realmente, preferenze espresse | presenza di un listener universale non esistente |
| Vault locale | Obsidian sul laptop | sync scelto dall'utente o tool locale (es. CLI) | aggiornamenti wiki e relazioni da Markdown | vedere il vault su Android senza sync |
| Corpo/benessere | eventuale fonte autorizzata | opt-in separato, interoperabilità possibile | segnali dichiarati/registrati dalla fonte | diagnosi o qualità psicologica della persona |

Non assumere che ogni fonte sia disponibile via API: discovery contratto, accesso, retention e limiti prima dell'adapter.

## 4. Primo flusso *davvero* automatico senza OAuth aggiuntivo

**Partire da ciò che possediamo già**: Cloudflare + GitHub.

Esempio:
- PR merge / failing checks / deployment modifica un repo;
- evento viene acquisito con timestamp, repository, commit/ref, URL origine e firma o query API autenticata;
- il normalizer riconcilia GitHub commit e Cloudflare deployment; se non corrispondono segnala DRIFT;
- il sistema deduce solo un fatto tecnico: «è cambiata la release» oppure «CI fallita»;
- l'Atlante aggiorna il nodo del progetto; il brief segnala: «Serve verificare la release»;
- il progetto resta proprietario di policy, clienti e metriche. Nessun click dell'utente per riportare che la PR è stata mergiata.

**Acceptance test:** due eventi identici non producono doppie note; 100% delle osservazioni hanno origin/ref/timestamp, stato UNKNOWN se API fallita o dati obsoleti; zero false action suggestions.

## 5. Life OS ogni mattina: un BRIEF, non un modulo vuoto

Home suggerita:
- «**La tua giornata, ricostruita dalle tue fonti**» e «Ultimo aggiornamento [ora]»;
- massimo 3 fatti recenti con link, distinti da 1–2 suggerimenti *proposti*;
- «Serve una tua decisione» solo se la policy/ruolo lo richiede e la fonte è esplicita;
- «Niente che richieda attenzione» se i feed sono collegati e non segnalano eventi;
- «Non ancora abbastanza fonti per un brief personale» se il sistema non ha permesso/connessioni;
- nessuna richiesta di compilare una priorità come barriera di ingresso;
- il sistema non misura il valore della persona in base ai task.

**Auto-generated focus** è un suggerimento derivato da fonti, non un fatto su ciò che "l'utente vuole". Approvazione con un gesto solo quando una scelta conta; ignorare un suggerimento non produce senso di colpa.

## 6. Obsidian senza drag & drop quotidiano

**Target:** un agente bibliotecario locale o autenticato riceve eventi approvati dai connettori; aggiorna /raw snapshots, calcola diff in /wiki, INDEX e LOG, esegue lint, chiede approvazione per nuove interpretazioni importanti. Il vault non è una cartella in cui l'utente deve importare ZIP quotidiani.

**Fase intermedia onesta:** l'attuale export ZIP è un backup/trasporto one-shot e la CLI offline richiede comando manuale. Non chiamarli sync. Per arrivare a zero-entry ci vuole una sola pipeline direzionale, con cursore, hash, hash collision, sync manifest, tombstone, device awareness. Prima decidere la fonte canonica: D1 master per eventi personali; Obsidian master per wiki locale curata oppure wiki proiezione read-only — NON due master incoerenti.

**Runtime proposto:** Cloudflare come ingestion/normalization backend; agent locale (Codex / Claude / Hermes) SOLO per scrivere nel vault Obsidian del laptop, se connesso e autorizzato. Non inventare accesso Cloudflare ai file locali di Omarchy.

## 7. Decisioni, dati intimi e consenso

**Autocattura e autoorganizzazione ≠ autorità a interpretare tutta la vita.**
- P0: dati pubblici business/dev senza uso improprio → può iniziare con adapter read-only autorizzato.
- P1: impegni e note personali → scopes, retention, limiti, review per azioni verso terzi.
- P2: salute/fede/famiglia/vita intima → *off-by-default* per AI e cloud ingest; per ogni gruppo consensuale fonte, periodo, uso, destinatario e cancellazione.
- P3: secret → mai catturarli o portarli in wiki.
- Per le persone diverse dal proprietario: minimizzare PII e non trattare come "evidence sui loro stati interiori" le opinioni presenti in email o conversazioni.
- Tutte le proposte AI hanno PROVENANCE, stato DRAFT e pulsanti APPROVA / NO / NON ADESSO. I controlli umani su azioni irreversibili restano.

## 8. Modello tecnico minimo

### Contracts
`SourceAdapter {source_key, owner_domain, auth_scope, discover(), pull(cursor), normalize(raw), revoke(), health()}`
`RawEvent {event_id, provider_id, event_type, occurred_at, observed_at, canonical_ref, source_hash, sensitivity, payload_locator, retention_policy, ingestion_version}`
`Observation {claim_id, source_refs[], type, text, status: OBSERVED|DECLARED|INFERRED_DRAFT, observed_at, valid_at}`
`Proposal {proposal_id, source_refs[], description, proposed_action, risk, expires_at, approval_required, state}`
`SyncReceipt {run_id, source_key, received, deduplicated, failures, cursor, verified_at}`

No raw secrets in events, no LLM use to control policy; idempotency `(provider,event_id)` UNIQUE; source hash as verification, not identity of a person; **type-stable timestamps** and source-local time zones.

### Cloudflare-first
Worker API / D1 ingest ledger + source registry; Crons per polling con rispetto rate limit, webhook signed per provider; Cloudflare Queues solo quando serve gestione asincrona/ritentativi; R2 soltanto per snapshot/documenti che non stanno bene in D1, con cifratura/retention. NO VPS permanente predefinita, NO vector database preventivo.

Separate jobs: `collector` (può accedere a sorgenti scope-appropriate) → `compiler` deterministico → `librarian` (proposte semantiche con fonti) → `presenter` (brief e grafo), con autorizzazione separata per `executor`. Ragionamento LLM a costo controllato, non invocato su ogni evento.

## 9. Roadmap corretta: NON partire dalla UI

**G0 sicurezza/release (bloccante):** verificare JWT, lineage release, backup/restore, environment isolation. Nessun accesso nuovo a dati personali se G0 non supera i test.

**G1 Automatic technical evidence (primo valore dimostrabile):** GitHub + Cloudflare, delta polling webhook auth, ingest dedup, timeline e brief tecnico reale. GO: >=30 eventi fixture, 0 duplicazioni, 100% source/timestamp, 0 falsi stati "confermato".

**G2 Automatic business signals:** Black Office source map, provider health, attribution correctly labeled. GO: 100% metriche con owner & refreshed_at, 0 revenue inventate.

**G3 One-time user connection for Calendar:** read-only, event privacy, no email scraping broad. GO: 100% eventi mostrati fonte e timezone, revoca testata. Gmail/Drive solo per use case mirato e consenso separato.

**G4 Continuous personal knowledge:** LLM Wiki agent ingestion selettiva con diff, memory provenance, hypotheses-draft, Obsidian sync unidirezionale, dedup/undo. GO: 100% raw immutable except owner erase, 100% derived claims with source, 0 implicit promotion sensitive material.

**G5 Ambient Jarvis:** brief generati quando cambiano fatti rilevanti e proposte con policy; se non c'è nulla di importante silenzio. GO: 0 azioni esterne senza gate e receipts.

**Gate di esperienza reale:** 7 giorni d'uso, ZERO trascrizioni/copie/inserimenti obbligatori; sistema produce briefing da >=1 fonte verificata e una decisione utile senza che l'utente debba digitare; tasso falsi allarmi sotto soglia fissata durante pilot; revoke completo.

## 10. Costruire bene il primo WOW

**Una dimostrazione semplice e verificabile:**
1. Modifica autentica GitHub o deploy Cloudflare, già avvenuta indipendentemente dalla dashboard.
2. Il Life OS la rileva da solo entro la finestra dichiarata (es. 15 minuti, misurata).
3. Aggiorna il progetto nell'Atlante con source URL, commit, ora e stato.
4. Se deriva un rischio concreto (es. deploy≠main o checks falliti), lo mostra nella home come **una singola attenzione**.
5. Nessuna nota inserita, nessun task spuntato, nessun prompt utente.
6. Se non succede niente, non inventa nulla e non manda spam.

Questo è il primo test di un **AIOS autoalimentato**. Fino a quel momento, la V1.4 è una bella UI con memoria manuale, non il prodotto finale.

## 11. Stop list

NON creare altre schermate di input per compensare la mancanza di adapter.
NON interpretare "zero-input" come permesso di captare tutto indiscriminatamente.
NON promettere lettura automatica delle chat ChatGPT da Cloudflare.
NON impiantare cron + LLM finché JWKS/auth/backup/release e privacy non sono solidi.
NON sostituire la fonte proprietaria dei business con proiezioni del Life OS.
NON pubblicare il vault Obsidian su repo pubblico.
NON dire che il sistema lavora autonomamente se si limita a esportare ZIP e import manuale.

## Decisione progettuale da applicare

Il prompt «Inserisci il tuo focus» NON deve essere il fondamento della home. Deve diventare un comando opzionale. «Consolida questa nota» NON è il principale modo in cui il Cervello impara: la fonte produce un draft, eventualmente un'interpretazione necessita microapprovazione. Una giornata senza input dell'utente può e deve essere una giornata con contesto aggiornato.
