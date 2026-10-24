# SOLIWKR — unica coda operativa
**Avvio:** 2026-10-24  
**Owner autorizzazioni:** Chris  
**Responsabile del coordinamento:** CEO — SOLIWKR (PaperClip agent già esistente)  
**Coda operativa canonica:** [PaperClipHQ / SOLIWKR Pro — issue SOL](https://hq.soliwkr.pro/SOL/issues). Questa pagina **non è una seconda coda**: definisce ingressi, regole e routing.

**Issue attualmente coordinata:** [SOL-43 — Ristrutturazioni Formia](https://hq.soliwkr.pro/SOL/issues/SOL-43). Nessuna seconda issue è autorizzata per la stessa delivery.

## Principio
**Una sola vista delle azioni vive; le fonti proprietarie restano separate.**
- Le **issue PaperClip SOL** registrano assegnatario, priorità, stato, blocker, approvazioni e link alle prove. Issue e aggiornamenti vivono unicamente lì.
- Ogni **repository proprietario** custodisce codice, specifiche, decisioni del prodotto, PR e test; non copie dello stato della coda. I dati live rimangono in D1/GSC/GA4/Stripe ecc. secondo owner.
- `soliwkr/Soliwkr` è il **router/governance**, non un monorepo e non una duplicazione dei backlog dei 29 progetti PaperClip.
- Le chat e Telegram sono interfacce. Nessun task è “chiuso” perché un agente lo dichiara.
- Non creare una nuova coda su GitHub Issues, un nuovo servizio, un bot dedicato o un workflow Cloudflare per duplicare PaperClip.

## Come entra e avanza il lavoro
1. Identificare il verdetto aggiornato del portafoglio e il sistema proprietario. `ARCHIVIARE`/`CONGELARE`/progetto solo inventariato non autorizza lavoro.
2. Cercare **prima** issue SOL esistenti e deliverable già approvati; creare al massimo un task mancante con URL repository e unico owner responsabile. Riutilizzare invece di riaprire task completati.
3. Ogni issue di delivery deve avere: **scopo**, `system_owner`, fonte/spec immutabile o pinned SHA, **unico prossimo passo**, owner, WIP, prove richieste, gate umano e rollback.
4. Limitare **WIP prodotto a 1** per il cantiere corrente; CEO decide quale issue alimentare. CTO/QA/Release sono ruoli, non nuove code o deleghe automatiche. Le issue cross-project già aperte non vengono cancellate né riordinate senza mandato.
5. Stato: `backlog → todo → in_progress → in_review → done`, oppure `blocked / cancelled`. Aggiornamento solo con prova/link/ora; in `blocked` indicare il *singolo requisito che manca*. Nessuna scadenza inventata.
6. **Gate:** owner approva posizionamento/claim commerciali, prezzi, spese, operazioni irreversibili, produzione, outreach e cambiamenti dei servizi live. La delega alla gestione non concede deploy autonomi.
7. Alla chiusura, registrare link a PR/commit, test QA, eventuale deploy/rollback ed evidenza metrica. Non segnare `done` su un piano o su un codice non distribuito quando il risultato richiede funzionamento live.
8. Nessun agente può produrre altre issue, assegnare nuovi agenti, spendere budget, avviare cron o aprire nuovi progetti per iniziativa propria.

## Primo pilota operativo: Ristrutturazioni Formia — modello nazionale CPL
- **Business owner:** RankEmpire Italia (autonomo rispetto a TROVATEMI); repository `soliwkr/rankempire-italia`. **Nuovo mandato owner 24/10:** costruire *progressivamente* una rete nazionale di siti SEO su long tail non servite, monetizzando con publisher-network CPL. Nessun modello di vendita diretta alle imprese, nessuna raccolta di PII dei lead, nessuna assistenza ai clienti dell'impresa.
- **Strategia proprietaria nazionale:** [CPL-NETWORK-ITALIA.md](https://github.com/soliwkr/rankempire-italia/blob/ops/rf-one-queue-20261024/strategia/CPL-NETWORK-ITALIA.md).
- **Spec primo pilota e sequenza RF-01..RF-10:** [RISTRUTTURAZIONI-FORMIA-DELIVERY.md](https://github.com/soliwkr/rankempire-italia/blob/ops/rf-one-queue-20261024/strategia/RISTRUTTURAZIONI-FORMIA-DELIVERY.md).
- **Sorgente preview v0.3:** [branch](https://github.com/soliwkr/rankempire-italia/tree/preview/ristrutturazioni-formia-v03/sites/ristrutturazioni-formia-v02).
- **Prima azione SOLO READ-ONLY:** RF-01 verifica source/deploy/403, verifica GSC e URL pubblici, baseline e rischi. RF-02 preview esclusivamente dopo gate tecnico. `ristrutturazioniformia.it` produzione non si tocca.
- **Evidenze precedenti da riusare:** [SOL-34](https://hq.soliwkr.pro/SOL/issues/SOL-34) DOI FAIL statico `/verify` vs `/api/leads/verify` **solo per il modello storico di raccolta diretta dei lead**, non prerequisito nel funnel CPL referral; [SOL-31](https://hq.soliwkr.pro/SOL/issues/SOL-31). Evitare duplicazioni.
- **Dipendenze esterne:** idoneità di almeno un network CPL publisher al verticale/traffico SEO e al territorio; Edilnet è soltanto benchmark e il suo funnel è a conversione sconosciuta; titolarità e informative legali, CMP iubenda **per dominio Formia**, GTM/GA4 Formia separati da eSIM, test GSC.
- **Definizione di successo del pilota:** sito autorevole, UX/test e performance, URL e SEO controllati, privacy/consenso verificati, conversione partner CPL attribuita e almeno un lead reale approvato/remunerato; economics verificati prima della replica nazionale. **Nessun cliente/renter da acquisire** e nessuna promessa di ranking.
- **Stop obbligatori per il ciclo attuale:** niente modifica alla VPS, spese, ads, nuovi domini/deploy finché non approvati, pubblicazione autonoma, falsi contenuti, traffic/lead fake, CRM/lead PII proprietari, outreach a imprese, merge non autorizzati, escalation. **I futuri siti nazionali fanno parte della strategia**, non di un GO esecutivo indiscriminato.

## Routine minima del CEO
Quando riceve un aggiornamento: rileggere issue PaperClip e spec repo, controllare l'unico work item attivo, fare check evidenza/CI/Cloudflare, aggiornare una sola issue con “fatto/provato, blocco, prossimo passo”. Portare all'owner soltanto i veri gate o dipendenze; non creare report cron duplicati o promettere lavoro continuo se l'agente non è effettivamente schedulato.

## Estensione ad altri progetti
Questa è una **regola generale di intake**, non un GO ai progetti congelati o fuori roadmap. Per RankEmpire, **il gate di scala ora dipende dalla validazione del CPL publisher e non dal primo renter pagante**. È già presente PaperClip per il portfolio. Prima di inserire nuovi workstream si riconciliano la coda preesistente e i verdetti più recenti, senza reimportare tutta la cronologia come lavoro attivo.
