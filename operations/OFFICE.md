# SOLIWKR — Ufficio Operativo (Operating Office v0.1)
Data decisione owner: 2026-10-21. Stato: protocollo approvato, integrazioni tecniche soggette a PR/test/release gate. Non creare un altro progetto, datastore o bot.

## Scopo
Fornire a Chris la funzione quotidiana di un socio operativo: apertura dell'ufficio, priorità, ritmo, follow-through, preparazione tramite agenti, verifica, chiusura e ripresa senza ricominciare da zero. Creatività all'owner; struttura al sistema. Evitare diagnosi personali: questo è un requisito operativo e di interfaccia.

## Autorità e separazione
- **SOLIWKR AIOS** possiede strategia cross-project, Operating Office, routing, calendario della priorità umana e ONE NEXT.
- **PaperClipHQ** possiede task, assegnatari, stato, evidenze e approvazioni; CEO = chief of staff/operatore, CTO/Staff/QA/Release solo se autorizzati e disponibili.
- **BLACK OFFICE** (`soliwkr/black-office`) possiede candidati economici, esperimenti, KPI, costi e decisioni economiche; non copiare OfficeState, eventi, metriche o contratto degli esperimenti.
- **Repo di asset** possiedono prodotto e consegna; **Stripe** e network affiliati possiedono lo stato originale dei pagamenti e commissioni.
- **Telegram** è l'interfaccia menu-first preferita già in lavoro nella task SOL-35, con un unico bot/webhook. Niente secondo bot né sostituzione del connettore nativo senza test e GO.
- **ChatGPT Automations** può spedire il briefing quotidiano come percorso di continuità, ma non è il system of record e non avvia automaticamente agenti o lavoro pagato.
- TROVATEMI è core autonomo ma FUORI dal Business Lab 90 giorni. Rispettare status TENERE/CONGELARE/ARCHIVIARE/ABBANDONARE e decisioni più recenti.

## Regola della pressione operativa
Un solo ONE NEXT **umano** attivo: massimo 25 minuti per il primo passo; un owner, criterio di completamento verificabile, deadline solo se grounded. Non bloccare la preparazione indipendente e reversibile in parallelo; non aprire altri esperimenti commerciali running senza mandato. Una nuova idea entra in PARKING / Business Lab candidate, non rimpiazza la priorità salvo decisione owner. Ogni sessione lascia un handoff durevole.

## Ciclo giornaliero (Europe/Rome)
### 08:00 circa — Apertura
1. Leggere task PaperClip già presenti e stato delle fonti, usando il timestamp reale; non inferire esiti da task DONE privi di prova.
2. Recuperare ONLY ONE NEXT corrente, scadenze reali, gate aperti, ultimi deliverable e cambiamenti dal briefing precedente.
3. BLACK OFFICE: mostrare il più importante candidato/esperimento con stato e metriche *verificate*; UNKNOWN non è zero.
4. Produrre messaggio corto in italiano: OGGI / FATTO / BLOCCATO / DECISIONE / NEXT 25 MIN / PROVA / LINK.
5. NON assegnare altri incarichi a Chris se il ONE NEXT non è concluso o esplicitamente cambiato.

### All'apertura di sessione
- Se Chris scrive una nuova idea, il CEO la preserva e riporta al ONE NEXT; può proporre sostituzione motivata, senza cambiare le priorità di nascosto.
- Azione successiva concreta sempre pronta, non lista infinita o report solo narrativo.
- Quando il primo passo supera 25 minuti, spezzarlo in un output osservabile.

### Durante il lavoro
- Task in PaperClip, non in copie parallele: owner, expected output, deadline se verificabile, accettazione, fonte, blocker e gate.
- Ricerca e preparazione non diventano autorizzazione a campagna, spesa, publish, deploy, merge, contatto a terzi o modifiche a dati live.
- Escalare con una sola richiesta deduplicata: decisione, proposta, prove, rischio, costo massimo, pulsanti/azioni CONSENTI SOLO QUESTA / MODIFICA / NO-GO / VEDI PROVE (quando supportati).

### Chiusura (manuale o tramite futuro trigger autorizzato)
Registra in PaperClip: COSA CAMBIATO, evidenza, decisione, blocco, prossimo task atomico. Prepara la prima azione del giorno seguente. Se nessuna fonte o azione disponibile: segnare UNVERIFIED/BLOCKED e indicare che cosa manca.

## Business Lab 90 giorni
- Tempo owner 10-15 h/settimana; budget potenziale €300-500 NON spesa autorizzata.
- Domanda esistente e piattaforme pronte prima del build; cercare opportunità globali, nuove e insolite.
- Obiettivo primo incasso reale entro 14 giorni dal GO di un test; target a 90 giorni €30/giorno lordi con contributo positivo; nessuna promessa.
- SOL-36 ha già consegnato 20 candidati e due microtest PROPOSTI. Non trasformarli in running senza gate; riusare prove.
- WIP commerciale = 1 salvo GO esplicito; misurare CAC, margine, conversioni, tempo owner e prova di pagamento/delivery.
- I criteri domanda 25 / acquisizione 25 / economia 20 / lancio 15 / autonomia 10 / replicabilità 5 servono solo a prioritizzare *cosa testare*.

## Eventi e idempotenza: contratto di integrazione futuro
`source_ref`, `source_updated_at`, `observed_at`, `subject_id`, `event_type`, `evidence_url`, `verification_state`, `correlation_id`. Un evento senza prova può generare una richiesta di verifica, mai una vendita fittizia. Non archiviare segreti o dati sensibili nel briefing. Dedup per `source_ref + event_type + source_updated_at`. Incidenti/approvazioni non transitano tramite semplice click nel menu.

## Definition of Done dell'ufficio
1. Il briefing automatico arriva; prima run verificata separatamente.
2. Mostra ONE NEXT davvero letto da PaperClip, con link e prova (o stato UNVERIFIED).
3. Un ciclo completo briefing -> task verificabile -> handoff -> briefing successivo viene dimostrato.
4. Integrazione BLACK OFFICE è di SOLA LETTURA e non inventa ricavi.
5. Menu Telegram esistente (SOL-35) supera QA mobile e auth prima di GO produzione.
6. Nessuna duplicazione di bot, runtime, schemi o datastore.

## Dipendenze aperte
- PR AIOS ONE NEXT #29 e Telegram menu #30 sono aperte, non equivalgono a produzione.
- Verificare operatività del frontend Control Room esistente e autorizzazioni API prima di qualsiasi deploy.
- Programmazione autonoma di PaperClip richiede quote e gate espliciti; il briefing ChatGPT non è un worker server-side.
