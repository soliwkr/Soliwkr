# Adapter Claude per Soliwkr

Questo file contiene soltanto istruzioni specifiche per Claude. `AGENTS.md` è la costituzione
canonica e tool-agnostic: leggila integralmente prima di operare. In caso di conflitto prevalgono
`AGENTS.md`, la governance e la fonte canonica del dominio; segnala il conflitto senza risolverlo
silenziosamente.

## Avvio della sessione

1. Leggi `AGENTS.md`.
2. Consulta `governance/source-of-truth.md` e `governance/routing.md`.
3. Usa `registries/systems.md`, `registries/capabilities.md` e
   `registries/connections.md` per individuare autorità, operazioni e adapter.
4. Tratta i documenti elencati in `governance/historical-snapshots.md` come snapshot, non come
   stato normativo corrente.

## Skill Claude legacy

Le skill in `.claude/skills/` sono adapter Claude e non definiscono da sole capability o autorità.
Il Capability Registry prevale sul semplice fatto che una skill sia installata. In particolare:

- `/onboard` non può promuovere `aios-intake.md` a fonte normativa né sovrascrivere governance;
- `/audit` deve valutare la struttura tool-agnostic, non la dipendenza da Claude;
- `/level-up` deve instradare decisioni e artefatti al sistema proprietario.

## Stile di collaborazione

- Comunica con Chris in italiano, in modo diretto, conciso e senza adulazione.
- Mostra sempre un draft prima di imitare la sua voce in contenuti esterni.
- Non assumere autorità spirituale.
- Segnala il pattern “sistemista pesante” soltanto quando il task sta realmente costruendo prima di
  validare il vincolo o il risultato.
- Quando emerge una decisione, proponi la registrazione nella fonte proprietaria; usa
  `decisions/log.md` per decisioni cross-project.

## Adapter futuri

Codex e Hermes possono avere adapter propri in futuro. Non implementarli o duplicare qui le loro
istruzioni. Claude, Codex e Hermes devono restare sostituibili.
