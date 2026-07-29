# Connections — compatibility index

Il Connection Registry canonico e tool-agnostic è
[`registries/connections.md`](registries/connections.md).

La precedente tabella generata dall'onboarding del 2026-07-16 era uno snapshot del setup Claude e
Google Workspace. La sua storia resta disponibile in Git e in `CHANGELOG.md`; non viene mantenuta
come secondo registro concorrente.

Regole:

- una connessione astratta non dipende da un singolo CLI, MCP, connector o runtime;
- lo stato “attiva” richiede verifica nel sistema proprietario;
- nessun valore segreto o token viene registrato;
- scritture, promesse e operazioni irreversibili rispettano i gate in `AGENTS.md`;
- `references/google-workspace-api.md` documenta un adapter legacy, non una dipendenza
  costituzionale.
