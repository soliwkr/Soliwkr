# Life OS — Knowledge Atlas & Karpathy LLM Wiki

Data: 2026-10-12. Owner: Chris. Scope: private Life Room. Repo: soliwkr/Soliwkr.

## Product

A new Atlas view joins the six focused Life OS rooms. The graph is an interactive SVG with navigation, filters, zoom and a selected-node detail showing provenance. The edges reflect documented structural relationships (the Studio contains named business projects; Vita has six self-reported domains; the Wiki links to the source and method). They are NOT inferred personal relationships, business traction, clinical evaluations or psychological inferences.

Desktop: sidebar Atlas; mobile: shortcut "Esplora l'Atlante" from Oggi.

## Karpathy / Obsidian export

The logged-in user taps "Vault Obsidian" in Atlas. GET /api/vault creates and streams a private ZIP, derived from D1 at export time. This does NOT place the user's private content in a public repository.

The ZIP contains:
- Soliwkr-Wiki/AGENTS.md — operating contract for agents and safety/privacy requirements.
- Soliwkr-Wiki/INDEX.md — linked index.
- Soliwkr-Wiki/LOG.md — append-only log starter.
- Soliwkr-Wiki/raw/snapshots/YYYY-MM-DD-control-room-vN.md — immutable self-report snapshot with source/version.
- Soliwkr-Wiki/wiki/ — a connected starting knowledge graph of Life OS, Vita, Studio, Cervello, Rituali, Principi, Metodo Karpathy, six life areas and ten project entities.

Karpathy's actual idea: RAW IMMUTABLE SOURCES → MAINTAINED LINKED WIKI → AGENT SCHEMA, with INGEST / QUERY / LINT. Primary reference: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f

No agent updates this vault automatically yet. No two-way sync to Obsidian or remote LLM. A later export is a new source: do NOT overwrite a human/agent-maintained vault wholesale. Obsidian Graph View works from regular Markdown wikilinks, without a plugin.

## Security and ownership

- Cloudflare Access is the perimeter of aios.soliwkr.pro. workers.dev / preview hostnames disabled.
- Endpoint sends Cache-Control: no-store, private and Content-Disposition: attachment.
- Frontend, repos and static graph nodes contain no diary text or personal data. D1 is the private source.
- GitHub repositories and each project's canon remain the authoritative record of their state; Black Office owns economic attribution.
- Access header presence is an additional check, not standalone JWT verification. Future server-to-server connectors need real cryptographic JWT/audience verification and least-privilege credentials.
- Data in the ZIP belongs to the user. It must not be committed to the public Soliwkr repository, uploaded to third parties or processed by external LLMs without informed authorization.
- No new monthly subscription, VPS, runtime or third-party app dependency.

## Verification & next gate

Verified: navigation and inline JS parse; mobile browser rendering shows graph and download entry; ZIP structure (29 entries and valid central directory); existing D1 schema untouched; Worker deployment successful.

Not verified end-to-end: authenticated Android Obsidian ZIP download, unzip, opening Graph View, all backlinks, data preservation across multiple devices.

Acceptance: Oggi → Atlante → select node → Vault Obsidian → unzip → open vault in Obsidian → verify both user notes and links. Do not claim completion until this user-authenticated test passes.

Next: human-reviewed ingest of one source with Codex into a private local Obsidian vault; deterministic link/staleness lint; only later a consent-based bidirectional sync and Self Model.

Rollback: Worker previous version; D1 untouched.
