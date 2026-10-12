-- Private Life OS knowledge ledger, additive and reversible.
-- Originals are immutable except through the explicit user erase flow.
CREATE TABLE IF NOT EXISTS knowledge_sources (
  id TEXT PRIMARY KEY,
  note_ref TEXT NOT NULL UNIQUE,
  raw_text TEXT NOT NULL,
  sha256 TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS knowledge_cards (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL UNIQUE REFERENCES knowledge_sources(id),
  title TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('observation','decision','lesson','question')),
  domain TEXT NOT NULL CHECK (domain IN ('general','studio','corpo','relazioni','fede','denaro','progetti','tempo')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS knowledge_cards_created ON knowledge_cards(created_at);
