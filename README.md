# Soliwkr — Operator & Portfolio AIOS

Questo repository è l'**office canonico** dell'AIOS personale di Chris: costituzione, governance, registry, routing, decisioni cross-project e playbook.

Non contiene fisicamente gli altri repository e non sostituisce le fonti canoniche dei singoli progetti.

## Workspace locale canonico

```text
~/AIOS/
├── office/      # clone di soliwkr/Soliwkr
└── projects/    # clone separato di ogni progetto
```

`~/AIOS` è una cartella workspace, non un repository Git.

## Leggi in questo ordine

1. [AGENTS.md](AGENTS.md)
2. [governance/source-of-truth.md](governance/source-of-truth.md)
3. [governance/acquisition-source-map.md](governance/acquisition-source-map.md)
4. [governance/routing.md](governance/routing.md)
5. [governance/development-canon.md](governance/development-canon.md)
6. [registries/systems.md](registries/systems.md)
7. [registries/capabilities.md](registries/capabilities.md)
8. [registries/connections.md](registries/connections.md)
9. [registries/cloudflare-starters.md](registries/cloudflare-starters.md)

## Canon di sviluppo

- **Cloudflare-first, mai Cloudflare-at-all-costs.**
- **Template-first:** prima di codice greenfield si esegue lo Starter Gate.
- GitHub conserva il codice e lo stato durevole del repository.
- Ogni progetto resta un repo autonomo.
- Editor, modelli e agenti sono sostituibili.

Vedi [governance/development-canon.md](governance/development-canon.md) e [playbooks/new-project-bootstrap.md](playbooks/new-project-bootstrap.md).


## Documentazione leggibile su Google Drive

Mirror umano: **AIOS — Canonical Office**  
https://drive.google.com/drive/folders/1FlfCLsZlws1hri9k048iDjSp_plE0ZSg

Contiene:
- `00 — Canon/AIOS — Canon e Architettura`
- `10 — Cloudflare/New Project Bootstrap — SOP`
- `10 — Cloudflare/Cloudflare — Starter & Repository Inventory`
- `20 — Projects` per documentazione umana dei singoli progetti quando serve
- `90 — Archive`

La documentazione Drive è una superficie leggibile e collaborativa. In caso di conflitto, le fonti
normative e machine-readable nel repository e nei sistemi proprietari prevalgono.
