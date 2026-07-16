# AIS-OS Intake

This is the source-of-truth file for your AIOS. Fill it in by typing, voice-pasting (Wispr Flow / OS dictation), or running `/onboard` for a guided conversation. Whichever mode, this file is what `/onboard` reads to scaffold your Day-1 setup.

**Hard cap: 7 questions.** Each answerable in under 60 seconds. Don't overthink — you can edit and re-run `/onboard` any time.

---

## Q1 — Who are you, what do you sell, who do you sell it to?

Identity, offer, ICP. One paragraph each is fine.

```
CHI SONO — Christian Fioravanti (Chris), solopreneur nel Sud Pontino (Formia → in trasferimento a Monte San Biagio), Lazio. Radici tecniche full-stack profonde (Astro, Next.js, React, Remotion, Cloudflare Workers). Opero come Studio Pura Luce / TROVATEMI.IT.

COSA VENDO — Google Reputation Management (GRM) + rank-and-rent SEO per business locali, su tre tier: ★ TROVATO €100/mese (solo recensioni), ★★ VISIBILE €300/mese (+ contenuti GBP), ★★★ INEVITABILE €500/mese (+ sito rank-and-rent esclusivo). Principio non negoziabile: white-hat only (zero review gating, piena conformità policy Google), posizionato come USP core. Piattaforma recensioni: Climbo (licenza lifetime). Stack: esclusivamente Cloudflare edge (Workers, D1, R2, KV, Pages, Queues, Workflows, Durable Objects, Vectorize, Workers AI).

A CHI — Business locali del Sud Pontino (province Latina + Frosinone). Cinque clienti founder-tier attuali (€0 durante il periodo founder in cambio di case study + referral): agenzia immobiliare a Formia (Vittorio, assistente Lorenzo — prima priorità; i doc su Drive lo chiamavano "Ivan", corretto), un cardiologo a Pescara, una palestra a Formia, un barbiere a Formia, il bar Ginos Club a Formia. Architettura rank-and-rent città-per-città (un sito = un tenant pagante = zero conflitti territoriali).
```

---

## Q2 — Paste 1-2 things you've written recently. Don't edit them.

An email, a LinkedIn post, a DM, a doc — anything that sounds like you when you're not trying. **Paste verbatim.** Do not type these mid-conversation with Claude — chat-shaped samples are worse than no samples (voice contamination).

```
un ultimo dettaglio.
è sempre andata cosi:

ieri ero forte, determinato e in forma fisica finalmente smagliante. mi sentivo veramente bene e silenzioso nel corpo.

mi ero detto: ora vado a dormire, domattina alle 6 compro climbo e vado a messa, perche è sabato e sabato dora in poi NON si lavora, MAI.

e stanotte... mi si stacca il microinfusore, glicemia a 400 che non è scesa fino a stamani.
una notte terribile che mi ha sfiancato e lasciato svegliarmi veramente distrutto.

sempre. sempre SEMPRe è accaduto cosi.

so che è un fatto medico fisico, non fraintendermi. non è che penso sia un segno.

quello che intendo è che ho sempre notato che c'è stato un orchestrare di eventi subito prima dello sferzare.

trovo curioso il fatto che io da quando ero piccolo sento e vedo spiriti (ed ora il mio dolce RE finalemnte) come se stessero nella mia stessa stanza, senza se e senza ma.

sono un po paralizzato perche cera lopzione di usare paypal a 3 rate, che sarebbe stato ottimo. 314 per tre mesi, nel frattempo avrei avuto operativita. quindi era gia stato deciso. poi stamattina al checkout, paypal mi ha detto no e l opzione non è piu disponibile. "come sempre". ma nn sento il mondo crollare. la mia risposta interna è stata "Tu sai"
```

```
Abbiamo già parlato. Questi mille non sono, nostri, questi sono miei. Nn contano per la sopravvivenza. Non c'è urgenza di per se. C'è una decisione da fare e lei anche sente nella carne che sia il passo giusto. Climbo è il bckend del servizio che così finalmente io smetto di costruire. È davvero la scelta giusta in questi termini. Perché permette a uno da solo come me di servire un servizio concreto alle attività locali senza impazzire e senza costruire sistemi per anni. Lo sento dentro come "finalmente vendi e basta".

I quaderni sono 3 da 300 doppie pagine l uno
Quadernini oggi cammino, immagina tutti i giorni da mercoledì ceneri a cristo re Dell universo.

Moltissimo materiale prodotto, md, obaidian e altro. C'è un sustrato di complessità legato al tempo eterno della Liturgia. Che dovremo dipanare. Ho sempre voluto creare un semplice sito per me e per altri, ma per me più che altro.
```

---

## Q3 — What are your 2-3 biggest priorities for the next 90 days?

Quarterly priorities. Not yearly aspirations. Things that, if not done by July, would make you say "I wasted Q2."

```
1. OBIETTIVO NUMERICO: 10 clienti ricorrenti a €300/mese (★★ VISIBILE) entro Natale = €3.000 MRR. Due motori in parallelo:
   a. Fondatori caldi a €0 (case study + demo vive) — primo: Vittorio (agenzia immobiliare Formia, assistente Lorenzo). NB: i doc su Drive lo chiamano ancora "Ivan", da correggere.
   b. Porta a porta a freddo, paganti — il vero motore dei €3.000. Stesso WOW (double-tap NFC su profilo del prospect vs concorrente): funziona a freddo, non serve aspettare un case study.
2. Climbo è già tuo (lifetime). Non è una decisione: resta solo il setup minimo (audit Sezione 8) — piano ★ TROVATO, coupon FONDATORE 100% forever, welcome email in tono, ricarica balance ~$20, SMTP @trovatemi.it, test col Demo Client. ~1 ora, una volta.
3. Fatturazione elettronica SDI: ora URGENTE (con i paganti porta a porta il primo incasso arriva presto). Stripe non emette via SDI — serve Fatture in Cloud o simile, prima del primo cliente pagante.
4. Trasferimento a Monte San Biagio entro fine settembre — allineato: è l'asse di espansione immobiliare (territorio Fondi/Monte San Biagio) previsto dalla Stella Polare, Parte 9.
```

---

## Q4 — Where does revenue actually land, and where is it tracked?

Multiple answers OK. Stripe? Skool? GoHighLevel? QuickBooks? A spreadsheet?

```
Incassi: Stripe via Climbo. Fatturazione elettronica SDI: NON risolta — buco aperto da chiudere (Stripe non emette via SDI, serve Fatture in Cloud o simile prima del primo pagante). Tracciamento pagamenti: probabilmente il foglio Google master (da confermare).
```

---

## Q5 — Where do you talk to customers, your team, and the outside world day-to-day?

Email (which one — Gmail / Outlook)? Slack? Teams? DMs (Skool / Discord / iMessage)? Phone?

```
Clienti/prospect: porta a porta di persona + WhatsApp + chiamate. DM Instagram/Facebook della pagina (pagina ancora DA CREARE). Email: Gmail info@trovatemi.it (di servizio); vorrei usare anche chris@trovatemi.it — anzi sto valutando una Google Chat operativa con email dedicata per il team/l'interno. Calendario: Google Calendar del workspace. Telefonia: ho una VPS, valuto di aggiungerci un centralino VitalPBX per le chiamate — così NON uso il telefono personale e non ricevo chiamate sul mio numero. Progetto collegato: voglio implementare il backend nel repo trovatemi-os. Brief mattutino operativo: su Google Chat (deciso).
```

---

## Q6 — Where do meeting recordings, notes, and important docs live?

Granola? Otter? Fireflies? Google Drive? Notion? Dropbox? A folder on your desktop you keep meaning to organize?

```
Google Drive (workspace trovatemi.it, upgrade a Business Starter in arrivo): Doc canonici (Stella Polare, Documento Totale) + call fondatori registrate/trascritte (06_MEETING_INTELLIGENCE). Registrazioni chiamate del call center (VitalPBX, rank-and-rent): destinazione decisa = R2 su Cloudflare (non sulla VPS). Ma è roba da dopo.
GitHub trovatemi-os: NON è codice esistente — è il progetto backend da costruire da zero (pensato per OpenAI Codex). Separato da climbo-audit.
Progetti rank-and-rent da intake a parte: agenziaimmobiliareformia.it (di Vittorio, da costruire) e ristrutturazioniformia.it (già online, da finire).
Obsidian: personale, corpus liturgico — DA TENERE FUORI dal business/AIOS. Un solo AIOS (questo), business; il vault liturgico resta separato e non indicizzato.
```

---

## Q7 — What's the one task that eats your week, and where do you currently track work?

The single biggest time-suck or recurring drudgery. Plus where tasks/projects live (ClickUp / Asana / Linear / Notion / a notebook).

```
Tracciamento lavoro: a mente, e malissimo — nessun sistema. È un buco reale.
Time-suck vero: il pattern "sistemista" — la spinta a costruire (FreePBX, backend trovatemi-os da zero, due siti rank-and-rent, pagina IG/FB, Google Chat operativa) invece di vendere. L'obiettivo è €3.000 MRR vendendo e Climbo copre già la delivery, quindi ogni ora di build prima della vendita è sospetta.
Nota confine: la roba personale/liturgica è un progetto a lungo termine a sé — FedeleMessaggero (avatar) + verbumlucis.it (sito) — TENUTA FUORI da questo AIOS di business.
```

---

When this file is filled, run `/onboard` (or re-run it) and the wizard will scaffold your Day-1 file set: `context/`, `references/voice.md`, populated `connections.md`, and a filled `CLAUDE.md`.
