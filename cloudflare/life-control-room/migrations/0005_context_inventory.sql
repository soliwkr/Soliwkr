-- Private AIOS context registry.
-- Stores only non-secret metadata and provenance. No sensitive personal content.
CREATE TABLE IF NOT EXISTS context_inventory (
  id TEXT PRIMARY KEY,
  destination TEXT NOT NULL CHECK(destination IN ('studio','connections','brain','rituals','life','atlas')),
  item_type TEXT NOT NULL CHECK(item_type IN ('connection','runtime','source','workflow','preference','resource','routine','other')),
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('active','connected','available','planned','remembered','needs_verification','inactive','unknown')),
  detail TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL CHECK(source IN ('live','github','cloudflare','memory','canonical','derived')),
  source_status TEXT NOT NULL CHECK(source_status IN ('verified','remembered','needs_verification')),
  observed_at TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS context_inventory_destination ON context_inventory(destination,name);
CREATE INDEX IF NOT EXISTS context_inventory_status ON context_inventory(status,name);
CREATE INDEX IF NOT EXISTS context_inventory_source ON context_inventory(source,source_status);
