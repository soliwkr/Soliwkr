# SOLIWKR — Personal Memory Ledger V1.4

Source: soliwkr/Soliwkr, private Life Room. Date: 2026-10-12. No LLM inference or background automation.

## Product

- **Cervello** preserves raw inbox notes. The owner selects ONE existing note, sets a title, kind (observation, decision, lesson, question), and an explicitly chosen life/project domain.
- Confirmation promotes the note into an approved knowledge card with immutable source excerpt + SHA256, timestamp and source-ref. This does NOT mean an AI has verified it.
- Knowledge cards appear in Cervello. An action may move the chosen title to Oggi as one of the three goals through the existing V1 gate. User confirmation is required to erase both the card and immutable copy; the original note remains in the inbox.
- **Atlante** reads D1 knowledge: up to six approved cards appear as nodes connected to the domain explicitly selected by the user. Nothing about third parties is inferred.
- **Obsidian export** includes raw/knowledge/ and wiki/Knowledge/ pages with provenance, wikilinks and review status.

## Data ownership

Life Room D1 alone owns these personal inputs; the public repository contains only schemas and code. Black Office, Trovatemi and independent projects retain their original source of truth. No model is given this data or called.

## Architecture and additive SQL

Migration: migrations/0002_knowledge.sql. Tables:
- knowledge_sources(id, note_ref UNIQUE, raw_text, sha256, created_at) — source snapshot, never silently overwritten.
- knowledge_cards(id, source_id UNIQUE, title, kind, domain, created_at) — the person's explicit interpretation of source.

Endpoints (Cloudflare Access perimeter, CSRF origin + x-control-room header for writes):
- GET /api/knowledge — read-only, source-aware cards, max 100.
- POST /api/knowledge — submitted note ID must exist in current D1 inbox, client cannot spoof raw text, fixed enums, one source per note.
- DELETE /api/knowledge/:id — erases card and source on explicit user intent. This is a privacy exception to raw immutability.
- GET /api/vault — includes the curated cards plus immutable raw in ZIP.

## Gates

- Pipeline Node 22: parsing, read/write with mocked D1, duplicate guard, spoof rejection, wrong origin, export, erasure.
- Run additive SQL before promoting new code to live. No writes to current private_state or existing client content.
- Manual: Android authenticated, save note, promote, see on Atlas, export ZIP; erase card and verify it disappears from new exports.
- Fail closed: if knowledge storage is missing, show unavailable, never pretend no entries or synthetic content.

## Limitations

- Not an automatic LLM distillation yet; the person approves their own title, kind and domain. Agents may propose but are not delegated write authority.
- Graph shows the most recent six memory entries. Older items remain in the Brain list/Obsidian export.
- The current Cloudflare Access perimeter is essential; cryptographic assertion verification is a follow-up defense-in-depth gate before external connectors.
- No private information is written to code, GitHub, R2, analytics or public URLs.
