# Workflow: Token Dashboard

## Objective
Gestire la dashboard locale di analytics per il consumo token di Claude Code, esposta
su `token.soliwkr.pro` via Cloudflare Tunnel con autenticazione Zero Trust.

## Trigger
- **Setup iniziale**: prima installazione su macchina nuova (o dopo `chezmoi apply`)
- **Manutenzione**: quando la dashboard non risponde, va aggiornata, o serve troubleshooting

## Required Inputs
- Accesso a Cloudflare (account con dominio `soliwkr.pro`)
- `cloudflared` installato (gestito da chezmoi/pacchetti)
- Token dashboard clonato in `~/Codice/token-dashboard`

## Tools Used
- `cloudflared` CLI — tunnel management
- `systemctl --user` — gestione servizi
- `python3` — runtime dashboard (stdlib only, zero dipendenze)

## Steps

### Setup iniziale (macchina nuova)
1. `chezmoi apply` installa pacchetti (incl. cloudflared), clona repo, crea unit files
2. `cloudflared tunnel login` — auth via browser (interattivo)
3. `cloudflared tunnel create token-dashboard` — crea tunnel, genera credentials JSON
4. Annotare il TUNNEL_ID dall'output
5. `export CF_TUNNEL_ID=<id>` e rieseguire `chezmoi apply` per generare config.yml
6. `cloudflared tunnel route dns token-dashboard token.soliwkr.pro` — CNAME automatico
7. Configurare Cloudflare Access (Zero Trust dashboard):
   - Application → Self-hosted → `token.soliwkr.pro`
   - Policy: Allow → email = la tua email
8. `systemctl --user enable --now token-dashboard cloudflared-token`
9. Verificare: aprire `token.soliwkr.pro` — deve mostrare login Access, poi la dashboard

### Aggiornamento token-dashboard
```bash
cd ~/Codice/token-dashboard && git pull
systemctl --user restart token-dashboard
```

### Troubleshooting
- **Dashboard non carica**: `systemctl --user status token-dashboard` — check log
- **Tunnel down**: `systemctl --user status cloudflared-token` — check log
- **Dati vuoti**: `python3 ~/Codice/token-dashboard/cli.py scan` — forza re-scan
- **DB corrotto**: `rm ~/.claude/token-dashboard.db` e ri-scannare
- **Porta occupata**: cambiare `PORT` nel service file e `daemon-reload + restart`

## Expected Outputs
- Dashboard accessibile su `token.soliwkr.pro` (con auth)
- Localmente su `localhost:8090`
- Auto-refresh ogni 30 secondi via SSE

## Architecture
```
~/.claude/projects/*.jsonl  →  scanner  →  ~/.claude/token-dashboard.db
                                                    ↓
                              python3 HTTP server (localhost:8090)
                                                    ↓
                              cloudflared tunnel → token.soliwkr.pro
                                                    ↓
                              Cloudflare Access (email OTP / GitHub SSO)
```

## Edge Cases & Failure Handling
- **Laptop spento** → dashboard offline (accettabile — dati locali)
- **cloudflared cade** → systemd restart automatico (RestartSec=5)
- **token-dashboard cade** → systemd restart automatico
- **Tunnel credentials scadute** → `cloudflared tunnel login` di nuovo
- **Aggiornamento Python** → verificare compatibilità (dashboard usa solo stdlib)

## Notes / Learnings
- La dashboard è stdlib-only Python, zero pip install
- Il DB SQLite è rigenerabile — basta cancellarlo e ri-scannare
- La porta 8090 è scelta per evitare conflitti con servizi dev sulla 8080
- Cloudflare Access free tier: fino a 50 utenti
