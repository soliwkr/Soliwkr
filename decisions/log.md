# Decisions Log

Append-only record of meaningful decisions and why they were made. `/level-up` Phase 2 (Method interview) writes scoped automation specs here. You can also append manually whenever you decide something worth remembering.

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
