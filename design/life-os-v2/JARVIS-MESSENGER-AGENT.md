# LIFE OS — JARVIS MESSENGER AGENT (Telegram first)
**Stato:** proposta di prodotto + piano di esecuzione, NON bot attivo. **Data:** 2026-10-13.
**Owner:** Operator & Portfolio AIOS (soliwkr/Soliwkr). L'agent runtime è sostituibile e non riscrive i dati canonici.
**Dipendenze:** ZERO-INPUT-ARCHITECTURE.md, MASTER-DESIGN.md, DELlVERY-GATES.md (file reale: DELIVERY-GATES.md), Issue #14 G0 security, Issue #15 G1 automatic evidence.

## 0 — Un agente dedicato, non un secondo cervello

**Principio:** Jarvis è la porta conversazionale *dedicata* al Life OS, non una chat che l'utente deve continuamente alimentare. Legge le proiezioni della memoria e le fonti autorizzate (owner per dominio), risponde e invia briefing utili. La Control Room visualizza la stessa realtà, Obsidian è un layer di conoscenza locale, Telegram è soltanto un trasporto.

```text
  GitHub · Cloudflare · Black Office → Source Collectors → Evidence Ledger → Brain/Graph
                 ↑                                                   ↓
           provider owners                             Life OS read-only tools
                                                               ↓
  Telegram DM ↔ Chat SDK Adapter ↔ Jarvis Think Agent ↔ Decision/Approval Policy
                                         ↕                     ↓
                                 same Life OS API        Human Review UI
                                         ↓                     ↓
                              Cloudflare Access UI / Obsidian approved export
```

Non creare un duplicato della memoria nel transcript Telegram. La memoria canonica e le decisioni restano nei sistemi di origine. Il transcript chat ha TTL, privacy e proprietario separato.

## 1 — Telegram vs WhatsApp: decisione

**Telegram V0.** Bot API semplice, webhook HTTPS, push dopo che l'utente ha avviato il bot, pulsanti, messaggi vocali opzionali, facile uso personale 1:1 e supporto nell'attuale Cloudflare Think Messenger ufficiale.

**WhatsApp soltanto V2**, dopo verifica delle regole Meta vigenti, numeri e costi reali. Al 2026-10-13 i WhatsApp Business Solution Terms contengono restrizioni sui general-purpose AI providers e differenze/regimi eccezionali per numeri SEE/Brasile; in Italia dal febbraio 2026 sono riportati costi specifici per chatbot AI, con vicenda AGCM/UE. Non scegliere WhatsApp come vincolo architetturale. Verificare conformità, template/window, uso e costo prima di eventuale implementazione.

**Telegram non è E2EE con i bot:** le chat con bot NON sono Telegram Secret Chats, quindi per contenuti P2 intimi usare soltanto un messaggio generico e un deep link alla Control Room Access protetta, non una notifica piena di dettagli su salute/famiglia/finanze.

## 2 — Starter Gate ufficiale

Candidati:
1. Cloudflare Agents, ufficiale, **Think Messenger Telegram** (`@cloudflare/think` + `agents` + `@chat-adapter/telegram` + `ai`). Documentazione ufficiale: https://developers.cloudflare.com/agents/harnesses/think/messengers/ e reference https://github.com/cloudflare/agents/tree/main/examples/think-chat-sdk .
2. Cloudflare official **Chat SDK Messenger Agent**: https://github.com/cloudflare/agents/tree/main/examples/chat-sdk-messenger ; controlli più granulari, più boilerplate.
3. Handwritten Worker Bot API: inutile reimplementazione di signature verification, dedupe, chat state e delivery, da evitare senza motivazione.

**Scelta proposta:** fork/adapter dell'esempio ufficiale Cloudflare Think/Chat SDK Telegram, pinned SHA da verificare al bootstrap. Framework API in evoluzione, fare spike compatibilità/DO migrations isolato prima di bloccarlo; se Think manca una funzione di gating usare Chat SDK Messenger example senza riscrivere tutto. Nessuna VPS né Agent Zero/Hermes aggiuntivo richiesti per farlo funzionare. Hermes eventualmente diventerà un consumer di intent o executor con la stessa policy, non source of truth.

## 3 — Job-to-be-done e contratti messaggi

**Outbound prioritari** (senza prompt dell'utente):
- `morning_brief`: max 3 fatti/attenzioni documentati + ultima verifica; se nessun segnale, niente messaggio oppure una sintesi silenziosa come preferenza.
- `material_change`: nuova CI failed, deployment mismatch, richiesta di approvazione reale; notifica solo alla variazione di stato, dedup e quiet hours.
- `approval_request`: un piano/decisione operativa con diff, link Access e scadenza, non un ordine da digitare.
- `weekly_recap`: fonti e decisioni approvate, non voto sulla produttività.

**Inbound natural-language** (operativo):
- «Cosa è successo mentre non c'ero?» → query su ledger; citations canoniche e freshness.
- «Com'è Trovatemi?» → adapter fonte proprietaria, non status inventato da push.
- «Perché avevamo deciso X?» → query source-backed su decision ledger/wiki; non so se fonte assente.
- «Cosa richiede davvero la mia attenzione?» → regole deterministiche per triage, sintesi AI soltanto su dati autorizzati.
- «Avvisa quando succede Y» → propone una watch con filtro e scadenza, crea solo con permesso.
- «Prepara una PR» → draft nel dominio autorizzato, nessun merge/deploy senza policy/gate.

**Non è data-entry:** la chat serve per *interrogare e governare* il sistema. I messaggi volontari possono aggiungere contesto ma non sono necessari per alimentare le fonti. Voice memo opzionale, non prerequisito e non registrazione continua.

## 4 — Security model minimo

- Telegram ingress webhook solo HTTPS; **secret_token** verificato dall'adapter (header `X-Telegram-Bot-Api-Secret-Token`), no query-string tokens. Bot token e webhook secret in Cloudflare secret store, mai in repo, URL, log o questa chat.
- **Pairing obbligatorio una volta**, tramite sessione `aios.soliwkr.pro` sotto Access dopo G0 JWT verification. Genera codice one-time con TTL, single-use, bind a Telegram `user_id` numerico + `chat_id`; non fidarsi di @username o del nome visualizzato. Fino al pairing: soltanto messaggio «Non collegato» e istruzioni, zero lettura di fonti.
- **Allowlist owner 1:1**, private DM only, group/forwarded message blocked (o no privileged processing); subject app login deve mappare al proprietario Life OS. Cloudflare Access attualmente può avere più email in policy: NON significa che siano tutte owner. Pairing non condiviso fra persone.
- Ogni tool ha permission contract e owner. Default read-only; write actions in `proposed`, approvazione in Access UI con CSRF/session validated e idempotency key. Per azioni esterne ad alto rischio (spesa, client, prezzi, publish) richiedere review e receipt, non affidarsi a un pulsante Telegram.
- Outbound sensitivity: P0 pubblico/p1 work metadata può comparire in DM con origine, mentre P2 intimo e contenuto di altri soggetti **never full text** su Telegram; deep link alla app privata. Secret P3 è sempre bloccato.
- Provider webhooks idempotency update_id, at-least-once, DB UNIQUE; reject replay and clock anomalies; scoping dei tool, cost quotas e abort; limiti flood/rate.
- Nessuna copia indiscriminata dei thread Telegram nel vault; TTL e cancellazione configurabili; no training di dati privati senza consenso esplicito.

## 5 — Esempio del vero flusso

`GitHub CI failed` → collector read-only salva evidence + repo+workflow_id+sha+time → policy riconosce FAIL nuovo/azione possibile → una card del brief da approvare/investigare → Jarvis manda DM: «⚠️ Workprint: pipeline fallita sul commit abc123, verificato alle 09:38. Vuoi vedere il log?» → un tasto «Apri evidenza» e uno «Non ora». Nessuna nota o task inseriti a mano. Non spiegare la vita privata da un log GitHub.

## 6 — Milestone e gate

**P0 (blocker):** JWT Access verificato, owner segmentation, production/preview separation, restore test, release lineage e rate budgets (Issue #14).

**M0 / pairing dry-run:** bot Telegram creato dal proprietario con BotFather, secret configurati su CF, webhook verified, DM pairing. Zero accesso a D1 personal data finché pairing e verifiche completati. TEST: forged secret/user/chat invalidi tutti bloccati.

**M1 / read-only agent:** `/stato`, `/oggi`, `/fonti`, natural questions source-backed, fallback UNKNOWN, source citations. First response p95 < 8s (subject to API), zero private leaks.

**M2 / proactive:** event ledger G1 alimenta notifiche materiali; dedup e digest; 0 spam su replay, 100% link source verificati, quiet hours default rispettati (configurabili); max 2 notifiche/day al primo pilot salvo problema realmente critico approvato dalla policy.

**M3 / approvals:** propose-diff-policy-receipt, UI Access per autorizzazioni sensibili, 0 esecuzioni esterne non approvate.

**M4 / multi-channel:** portare lo stesso backend ad altri canali, WhatsApp solo se termini/costi/sicurezza sono verificati; NON copiare memoria per provider.

## 7 — Cosa serve concretamente dall'utente (solo una tantum)

- Aprire Telegram → @BotFather → `/newbot` → scegliere nome e username → **conservare token privatamente, non incollarlo nella chat, non committarlo**.
- Usare la pagina sicura di setup CF/AIOS *quando implementata* oppure `wrangler secret put` in contesto autorizzato per token e secret webhook. L'utente non deve mai scrivere chat ID a mano: rilevarlo e associare con pairing Access.
- Inviare `/start` nel proprio DM (Telegram non consente al bot di iniziare una conversazione con un utente che non l'ha avviato). Confermare il pairing una volta nel Life OS.

**GO**: chat Telegram personale con prima risposta verificabile e un nuovo evento di GitHub comparso senza data entry; no leak su chat non abbinata. **NO GO**: token esposto, altro account legge la memoria, risposta senza fonte presentata come certezza, bot spam o azione esterna senza gate.

## 8 — Release/scope

Non modificare l'attuale `soliwkr-life-room` con endpoint Telegram sotto Cloudflare Access senza disegno di routing: Telegram non può presentare cookie di Access. Il messenger ingress deve avere host/route dedicata pubblicamente raggiungibile con webhook-secret **e application-level sender authorization**; i dati privati si interrogano tramite API interne soggette a verified actor. Preferire Worker separato con policy dedicate e schema di auth inter-service verificabile. Evitare `workers.dev` esposto non governato.

Nessun servizio AI/messenger attivo creato con questa specifica. Non fare OAuth né pubblicare token senza gate.
