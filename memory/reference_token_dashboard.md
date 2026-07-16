---
name: Token Dashboard
description: Dashboard analytics Claude Code — ~/Codice/token-dashboard, esposta su token.soliwkr.pro
type: reference
---

- Repo: nateherkai/token-dashboard (clonato in ~/Codice/token-dashboard)
- Servizio: systemd user `token-dashboard.service` su porta 8090
- Tunnel: systemd user `cloudflared-token.service` → token.soliwkr.pro
- Auth: Cloudflare Access (Zero Trust)
- DB: ~/.claude/token-dashboard.db (SQLite, rigenerabile)
- SOP: workflows/token_dashboard.md
