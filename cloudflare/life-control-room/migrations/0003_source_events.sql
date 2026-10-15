-- Additive, source-backed public technical event ledger. No personal raw payloads.
CREATE TABLE IF NOT EXISTS source_events (
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL,
  source_key TEXT NOT NULL,
  event_type TEXT NOT NULL,
  summary TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  observed_at TEXT NOT NULL,
  source_url TEXT NOT NULL,
  PRIMARY KEY(provider,event_id)
);
CREATE INDEX IF NOT EXISTS source_events_occurrence ON source_events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS source_events_source ON source_events(source_key,occurred_at DESC);
CREATE TABLE IF NOT EXISTS source_checks (
  provider TEXT NOT NULL,
  source_key TEXT NOT NULL,
  checked_at TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('ok','error','unknown')),
  error_code TEXT NOT NULL,
  events_seen INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(provider,source_key)
);
