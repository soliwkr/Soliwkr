# Decisions Log

Append-only record for Soliwkr's constitutional and genuinely cross-project decisions. Decisions
specific to a business or system belong in the decisions log of that owning domain. `/level-up`
may propose an entry, but does not write every automation specification here automatically.

**Format per entry:**

```
## YYYY-MM-DD — Short title

**Decision:** what was decided.

**Why:** the reasoning, constraints, and what would change your mind.

**Alternatives considered:** what else was on the table.

**Owner:** who's accountable.
```

Keep it terse. Future-you will thank present-you for capturing the *why*, not just the *what*.

---

## 2026-07-29 — Soliwkr diventa Operator & Portfolio AIOS

**Decisione:** `soliwkr/Soliwkr` è l'Operator & Portfolio AIOS personale di Chris: costituzione,
registry, routing e memoria cross-project. Non è il business OS TROVATEMI, il database operativo o
il runtime dell'agente. `AGENTS.md` è canonico e tool-agnostic; `CLAUDE.md` è un adapter subordinato.
Runtime, interfacce e adapter restano sostituibili.

**Why:** il modello precedente duplicava strategia TROVATEMI e confondeva AIOS, business OS,
agente, workflow e datastore. Ogni dominio deve conservare una sola autorità. Soliwkr registra dove
si trova e applica i gate senza incorporarla.

**Conseguenze:** TROVATEMI viene instradato a `trovatemi-os`; RankEmpire possiede la factory;
`climbo-audit` resta evidence layer; D1 possiede lead/asset/stati designati; Climbo resta downstream
nella corsia high-ticket. `aios-intake.md` e i documenti TROVATEMI precedenti sono snapshot storici.
Il portfolio include anche il sistema autonomo `soliwkr/esim` e il prodotto pubblico
`senzaroaming.it`, instradati alle fonti proprietarie e indipendenti da TROVATEMI. Sono istituiti
registri di sistemi, capability e connessioni, più un ordine esplicito delle fonti.

**Alternative considerate:** mantenere Soliwkr come AIOS solo TROVATEMI; rendere Hermes o Claude
il centro del sistema; inglobare repository e dati in un monorepo. Scartate perché creano lock-in,
autorità concorrenti e fragilità al cambio di strumento.

**Gate:** Chris mantiene l'approvazione su identità, offerte, prezzi, promesse, procedure, domini,
deploy previsti, messaggi sensibili, contratti, conversioni, fonti normative e irreversibilità.

**Owner:** Chris.

---

## 2026-07-16 — Priorità Q3: €3.000 MRR entro Natale, due motori

**Decisione:** obiettivo trimestre = 10 clienti ricorrenti a €300/mese (★★ VISIBILE) = €3.000 MRR entro Natale. Due motori in parallelo: (a) fondatori caldi a €0 come case study/demo vive, primo Vittorio (immobiliare Formia, assistente Lorenzo); (b) vendita porta a porta a freddo, paganti, come vero motore dei ricavi. Stesso WOW: double-tap NFC sul profilo Google del prospect vs concorrente — funziona a freddo, non serve aspettare un case study.

**Why:** il double-tap dimostra il problema sul profilo del prospect stesso, quindi la vendita a freddo è possibile subito. Climbo è già posseduto (lifetime): nessun blocco d'acquisto, solo setup Sezione 8 dell'audit (~1h). Niente blocca l'avvio se non i messaggi mandati / le porte bussate.

**Conseguenze immediate:** SDI fatturazione elettronica passa da "non urgente" a URGENTE (i paganti arrivano presto; Stripe non emette via SDI → serve Fatture in Cloud).

**Correzione (input Chris):** la delivery NON è il collo di bottiglia. Climbo la automatizza (3 agenti SEO/Social/GEO; "effort dopo setup quasi zero"). Carico umano residuo = solo onboarding + setup calendario, non lavoro continuo. Quindi 10× ★★ è realistico e il vero vincolo è il volume di vendita (porte + demo). La tensione "orizzontale vs verticale" della Stella Polare si ridimensiona: temeva il drowning nella delivery, che Climbo rimuove. Rischio sistemista residuo: ottimizzare Climbo invece di bussare (Stella Polare Parte 8).

**Owner:** Chris.

---

## 2026-07-16 — Canale del brief mattutino operativo = Google Chat

**Decisione:** il brief mattutino ("oggi fai X") che l'AIOS produrrà sarà consegnato su uno **spazio Google Chat dedicato** via incoming webhook. Non WhatsApp, non SMS, non telefono.

**Why:** già dentro il Workspace trovatemi.it (zero account nuovi); l'incoming webhook è un solo URL, l'AIOS ci posta con un curl senza auth da rinnovare; resta separato da WhatsApp che è il canale di vendita coi clienti. Vincolo forte di Chris: non vuole ricevere chiamate sul numero personale né usare il telefono personale per il business — motivo per cui il VoIP/VitalPBX ha senso, ma dopo.

**Alternatives considered:** WhatsApp Business API (scartata: richiede numero dedicato + template Meta approvati = giorni di setup, anti-guardrail); SMS; email Gmail (si perde nel mattino).

**Owner:** Chris.

---

## 2026-07-16 — Build parcheggiato fino a Sezione 8 Climbo chiusa

**Decisione:** tutto il "da costruire" resta fermo finché non sono fatte le 6 checkbox della Sezione 8 del PLAYBOOK Climbo (piano ★ TROVATO, coupon FONDATORE, welcome email in tono, balance ~$20, SMTP @trovatemi.it, test Demo Client). In parcheggio: numero VoIP (heyweb.it), sito rank-and-rent via API/prompt-site di Climbo, centralino VitalPBX, pagina IG/FB, backend trovatemi-os.

**Why:** è il guardrail sistemista applicato — e non è opinione mia, è scritto nel suo stesso audit (Sezione 8, "Cosa NON configurare adesso": webhook, Zapier, API, affiliate, SDI, tier ★★/★★★). Il "minimo brand" che Chris vuole finire È già dentro la Sezione 8 (SMTP + welcome email), non un progetto a parte. La Playwright del repo climbo-audit NON configura nulla: è solo un crawl di documentazione (screenshot + note), senza credenziali salvate. Quindi la Sezione 8 si fa a mano, ~1h.

**Owner:** Chris.

---

## 2026-07-16 — Registrazioni call center → R2 Cloudflare

**Decisione:** le registrazioni delle chiamate del call center rank-and-rent (VitalPBX su VPS) andranno su **R2 di Cloudflare**, non sulla VPS. Roba da implementare dopo (seconda metà agosto).

**Why:** coerente con lo stack edge-only Cloudflare; R2 è storage durevole e a basso costo, la VPS non è il posto giusto per accumulare registrazioni. Non è lavoro di questa settimana.

**Owner:** Chris.


---

## 2026-10-01 — Cloudflare-first e template-first diventano canon cross-project

**Decisione:** Cloudflare è la piattaforma di sviluppo e produzione predefinita per i nuovi progetti,
senza diventare un vincolo assoluto. Prima di scrivere codice applicativo greenfield è obbligatorio
eseguire lo Starter Gate: template/starter ufficiale Cloudflare, repository/reference ufficiale,
starter ufficiale del framework compatibile, repository affermato e mantenuto, adattamento/fork;
solo come ultima scelta si parte da zero con motivo documentato.

**Why:** standardizzare riduce frammentazione, setup ripetuti e codice già risolto. Cloudflare offre
un percorso coerente tra local development, Workers e binding di piattaforma, mentre l'escape hatch
VPS/Docker/Postgres evita di piegare la piattaforma a workload non adatti. L'inventario deve restare
vivo perché template e percorsi raccomandati cambiano.

**Conseguenze:** `governance/development-canon.md` governa lo sviluppo cross-project;
`registries/cloudflare-starters.md` è il catalogo di partenza; ogni nuovo progetto registra la
provenienza dello starter e le deviazioni. Il workspace locale resta `~/AIOS/office + projects`,
non un monorepo Git: ogni progetto mantiene il proprio repository.

**Alternative considerate:** scegliere piattaforma/framework da zero per ogni progetto; Cloudflare-only;
un monorepo che inglobi tutti i business. Scartate perché aumentano drift, lock-in o accoppiamento.

**Owner:** Chris.

---

## 2026-10-04 — BLACK OFFICE, WORKPRINT e pstack separano i poteri del sistema

**Decisione:** BLACK OFFICE diventa l'economic control plane del portfolio e resta un progetto/repository autonomo. WORKPRINT resta un asset/repository autonomo e comunica con BLACK OFFICE tramite contratti ed eventi. `soliwkr/Soliwkr` resta l'Operator & Portfolio AIOS e registra routing, limiti e decisioni cross-project. `soliwkr/pstack` governa il modo in cui gli agenti modificano software, ma non entra nel runtime. Cloudflare esegue i componenti, non definisce policy.

**Why:** il monorepo unico avrebbe violato il canon workspace del 2026-10-01 e confuso autorità. La separazione permette a BLACK OFFICE di auto-migliorare configurazioni ed esperimenti senza auto-concedersi poteri sul codice o sulla Constitution. pstack aggiunge una disciplina verificabile per ogni modifica sorgente. Il sistema è self-improving ma non self-governing.

**Starter Gate:** BLACK OFFICE usa come base primaria `cloudflare/templates/workflows-starter-template`, integrando i pattern ufficiali `hello-world-do-template` per `OfficeState` SQLite. WORKPRINT usa `cloudflare/templates/react-router-hono-fullstack-template`. Sono state scartate basi community e starter SaaS più pesanti. Lo stato canonico V0.2 di BLACK OFFICE usa un Durable Object SQLite perché l'account Cloudflare ha già 10 database D1 e nessun database esistente viene cancellato o riutilizzato senza decisione esplicita.

**Conseguenze:** Queue `black-office-events` e `black-office-events-dlq` sono state create sull'account Cloudflare. Il bootstrap BLACK OFFICE corregge l'idempotenza degli eventi e conteggia exposure/conversion sulle arm; l'LLM resta proposal-only. R2 con dati personali non viene creato finché non è configurata una giurisdizione appropriata. I repo remoti `soliwkr/black-office` e `soliwkr/workprint` restano da creare; fino ad allora i bootstrap locali non sono source of truth remoto.

**Alternative considerate:** monorepo dentro `soliwkr/Soliwkr`; BLACK OFFICE e WORKPRINT nello stesso repo; D1 condiviso con un progetto esistente; starter community. Scartate per violazione del canon, accoppiamento, rischio dati e minore supportabilità.

**Owner:** Chris.
