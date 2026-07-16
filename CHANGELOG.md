# Changelog operativo

Log cronologico di cosa facciamo sessione per sessione. Ogni entry documenta le modifiche
apportate al sistema, i file toccati, e le decisioni prese.

---

## 2026-07-16 (sessione sera) — Brief mattutino Google Chat + Tasks, config Climbo ★ TROVATO, memoria nel repo

### Cosa
- Rifatto `/onboard` per intero con Chris (Q1-Q7 nelle sue parole). Rimosso "Telegram bot Marco" (errore). Confini personali fissati: FedeleMessaggero (avatar) + verbumlucis.it (sito) restano FUORI dall'AIOS di business. Linea premium €6.800 "a tutto tondo" parcheggiata.
- Consolidata la memoria: spostata da `~/.claude/projects/.../memory/` a **`Soliwkr/memory/`** + symlink dal vecchio percorso. Un cervello solo, versionato, riproducibile via git.
- Configurato il piano **★ TROVATO** su Climbo, tab per tab: SEO Agent ON (è il prodotto), Social sharing ON (FB+IG), **Review Filter OFF** (white-hat, non negoziabile), Performance/AI Ranking ON, Social Agent/GEO Agent/Profile OFF (parcheggiati per i tier alti). Price €100, Allow coupons ON, tasse OFF (SDI a parte).
- Costruito il **brief mattutino operativo**: `tools/morning_brief.py` legge Google Calendar di oggi + Google Tasks (via SA) + `context/priorities.md`, compone nel tono di Chris, posta su Google Chat (spazio "Operativo"). Timer systemd 07:30 (in chezmoi). Tasks filtrate per lista (`TASKS_LISTS`) per tenere fuori la lista personale.
- Nuove memorie: `project_immobiliare_distribuzione` (pitch: il problema è la distribuzione, non il contenuto), `project_audit_generator_skill` (da fare). Contesto Vittorio arricchito (rapporto caldo, ex-agente immobiliare di Chris).

### Perché
- Il brief è il "co-founder al mattino" che spinge alla vendita (il vero vincolo). Tasks integrato colma il buco "traccio a mente e fa schifo" (Q7).
- Memoria nel repo = allineata all'ethos "se il laptop muore, git/chezmoi ricostruisce tutto".

### File toccati
**Repo Soliwkr:** `aios-intake.md`, `context/about-me.md`, `context/about-business.md`, `context/priorities.md`, `connections.md`, `CLAUDE.md`, `decisions/log.md`, `.env` (gitignored), `tools/morning_brief.py` (nuovo), `memory/*` (spostata dentro il repo).
**Chezmoi:** `dot_config/packages-arch-core.txt` (+ gam, google-cloud-cli), `dot_config/systemd/user/morning-brief.service` + `.timer` (nuovi).
**Repo climbo-audit:** `git pull` (fix Ivan→Vittorio sceso in locale).

### Decisioni loggate (`decisions/log.md`)
- Brief su Google Chat (no telefono/numero personale). Build parcheggiato fino a Sezione 8 Climbo chiusa. Registrazioni call center → R2 Cloudflare.

### Azioni manuali rimanenti
1. **Welcome email Climbo** (bozza) + resto **Sezione 8** (coupon FONDATORE, balance ~$20, SMTP @trovatemi.it, test Demo Client).
2. **SDI**: Fatture in Cloud ↔ Stripe prima del primo pagante — confermare regime IVA col commercialista.
3. **Skill audit-generator**: trasformare l'audit reputazione (fatto a mano per Vittorio) in generatore riutilizzabile per il porta a porta.
4. **Brief su Cloudflare Worker + Cron** (v2 always-on, indipendente dal laptop).
5. Eventuale **lista Tasks dedicata** "TROVATEMI" → aggiornare `TASKS_LISTS` in `.env`.

---

## 2026-07-16 — Onboarding AIOS + canale Google Workspace (SA + DWD)

### Cosa
- Eseguito `/onboard`: intake completo, scaffold Day-1 (`context/`, `references/voice.md`, `connections.md`, `CLAUDE.md` riempito), memoria e `decisions/log.md` aggiornati.
- Priorità Q3 fissata: 10 clienti ricorrenti a €300/mese (€3.000 MRR) entro Natale — porta a porta + fondatori (primo: Vittorio, ex "Ivan").
- Creato canale `script` per Google Workspace trovatemi.it: SA `aios-workspace@soliwkr.iam` (progetto `soliwkr`) con domain-wide delegation, impersona `info@trovatemi.it`.
- Fix "Ivan" → "Vittorio" sui 4 Doc canonici via Docs API (30 occorrenze, verificato 0 residui).
- Corretto `Ivan` → `Vittorio` anche nel repo `climbo-audit` (locale, push in attesa di ok).

### Perché
- L'MCP Drive legge/crea ma non edita i Google Doc esistenti. Il canale `script` (CLI-first per auth, tool Python per l'op) lo permette e resta riusabile — allineato ad `ARCHITECTURE.md`.

### File toccati
**Repo Soliwkr:**
- `aios-intake.md`, `context/*`, `references/voice.md`, `references/google-workspace-api.md` (nuovo), `connections.md`, `CLAUDE.md`, `decisions/log.md`
- `tools/gdocs_replace.py` (nuovo), `requirements.txt`, `.env` (path chiave SA + subject)

**Fuori repo:**
- `~/.config/aios/aios-workspace-sa.json` — chiave SA (600, gitignored per posizione)
- GCP progetto `soliwkr`: API Docs/Drive/Sheets abilitate, SA `aios-workspace` + chiave
- Admin console trovatemi.it: DWD autorizzata per client `110215454816142170622`

### Azioni manuali rimanenti
1. Push repo `climbo-audit` (fix Vittorio) — su ok di Chris
2. Correggere copie duplicate Stella Polare / Documento Totale (governance vs root) → tenerne una canonica
3. Tracciare in chezmoi: `gam` + `google-cloud-cli` nei `packages-arch*.txt` (install non ancora dichiarativo)
4. Fatturazione elettronica SDI: collegare Fatture in Cloud ↔ Stripe prima del primo cliente pagante

---

## 2026-07-14 — Traduzione UI Token Dashboard in italiano

### Cosa
- Tradotta l'intera interfaccia web della token-dashboard in italiano
- Tab navigazione, KPI, glossario, label tabelle, grafici, impostazioni, suggerimenti, modali

### File toccati
- `~/Codice/token-dashboard/web/index.html`
- `~/Codice/token-dashboard/web/app.js`
- `~/Codice/token-dashboard/web/routes/overview.js`
- `~/Codice/token-dashboard/web/routes/prompts.js`
- `~/Codice/token-dashboard/web/routes/sessions.js`
- `~/Codice/token-dashboard/web/routes/projects.js`
- `~/Codice/token-dashboard/web/routes/skills.js`
- `~/Codice/token-dashboard/web/routes/tips.js`
- `~/Codice/token-dashboard/web/routes/settings.js`

---

## 2026-07-14 — Token Dashboard + Cloudflare Tunnel + Chezmoi hardening

### Cosa
- Integrato [nateherkai/token-dashboard](https://github.com/nateherkai/token-dashboard) come strumento di analytics per il consumo token di Claude Code
- Setup always-on: systemd user service + Cloudflare Tunnel → `token.soliwkr.pro`
- Cloudflare Access (Zero Trust) per autenticazione
- Migrato systemd units orfani in chezmoi (elephant, second-brain, ollama)
- Creato sistema di changelog operativo e relativa SOP

### Perché
- Visibilità sui costi e pattern di utilizzo di Claude Code
- Accesso remoto alla dashboard da qualsiasi device
- Hardening del setup: se il laptop muore, `chezmoi apply` ricostruisce tutto

### File toccati

**Chezmoi** (`~/.local/share/chezmoi/`):
- `dot_config/packages-arch-core.txt` — aggiunto `cloudflared`
- `run_once_after_20-clone-repos.sh.tmpl` — aggiunto clone `nateherkai/token-dashboard`
- `dot_config/systemd/user/token-dashboard.service` — nuovo
- `dot_config/systemd/user/cloudflared-token.service` — nuovo
- `dot_config/systemd/user/elephant.service` — migrato da orfano
- `dot_config/systemd/user/second-brain.service` — migrato da orfano
- `dot_config/systemd/user/second-brain.timer` — migrato da orfano
- `dot_config/systemd/user/ollama.service` — migrato da orfano
- `private_dot_cloudflared/config.yml.tmpl` — nuovo (template tunnel)
- `run_once_after_45-systemd-services.sh.tmpl` — nuovo (enable + linger + reminder)

**Repo Soliwkr**:
- `CHANGELOG.md` — questo file
- `workflows/changelog.md` — SOP per mantenere il changelog
- `workflows/token_dashboard.md` — SOP setup/manutenzione dashboard

### Azioni manuali rimanenti
1. `sudo pacman -S cloudflared`
2. `git clone https://github.com/nateherkai/token-dashboard.git ~/Codice/token-dashboard`
3. `cloudflared tunnel login` (browser auth)
4. `cloudflared tunnel create token-dashboard`
5. Aggiornare `CF_TUNNEL_ID` e rieseguire `chezmoi apply`
6. `cloudflared tunnel route dns token-dashboard token.soliwkr.pro`
7. Configurare Cloudflare Access per `token.soliwkr.pro`
8. `systemctl --user enable --now token-dashboard cloudflared-token`
