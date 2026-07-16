---
name: Infrastruttura utente
description: Stack di sistema dell'utente — Arch Linux, chezmoi, omarchy, systemd user services
type: user
---

- OS: Arch Linux (desktop con Hyprland/omarchy)
- Dotfiles: chezmoi (`~/.local/share/chezmoi/`) — gestisce pacchetti, dotfiles, systemd units, clone repos, SSH, ecc.
- Pacchetti: lista in `dot_config/packages-arch-core.txt` e `packages-arch-desktop.txt`, installati via yay
- Systemd: user services per elephant, ollama, second-brain (timer notturno), token-dashboard, cloudflared
- Shell: zsh con starship
- Editor: neovim
- Repos personali: clonati in `~/Codice/` via script chezmoi
- Vault: `~/vault/` (second brain con routine notturna Claude)
- Dominio: soliwkr.pro (Cloudflare)
