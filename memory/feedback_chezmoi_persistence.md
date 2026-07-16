---
name: Chezmoi persistence check
description: Quando modifico config di sistema (systemd, dotfiles, pacchetti, cloudflared), devo proporre di aggiungerli a chezmoi per disaster recovery
type: feedback
---

Ogni modifica a file di sistema fuori dal repo (systemd units, dotfiles, config CLI, pacchetti) deve essere proposta per l'aggiunta a chezmoi.

**Why:** L'utente gestisce il suo setup con chezmoi (~/.local/share/chezmoi/) come disaster recovery. Se il laptop muore, `chezmoi apply` su macchina nuova deve ricostruire tutto. File di sistema non tracciati in chezmoi vanno persi.

**How to apply:** Alla fine di ogni sessione dove ho toccato file fuori da ~/Soliwkr/ (systemd units, config in ~/.config/, pacchetti installati, ecc.), chiedi: "Aggiungo questo a chezmoi per renderlo permanente?" e proponi i file/modifiche specifiche.
