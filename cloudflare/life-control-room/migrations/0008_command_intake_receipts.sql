-- Additive technical receipts. Apply only with a separately authorized migration.
-- No backfill: legacy duplicates require an explicit owner decision.
CREATE TABLE IF NOT EXISTS command_intake_receipts (
  intake_key TEXT PRIMARY KEY,
  task_id TEXT NOT NULL UNIQUE
);
-- No immediate FK: receipt, task and audit are committed in one D1 batch.
