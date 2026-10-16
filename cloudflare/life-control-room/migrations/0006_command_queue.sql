-- Command Queue G0: private cross-project execution contract.
-- Never seed a person's tasks or decisions in the public repository.
CREATE TABLE IF NOT EXISTS command_tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 180),
  outcome TEXT NOT NULL,
  why_now TEXT NOT NULL,
  done_when TEXT NOT NULL,
  source_kind TEXT NOT NULL CHECK(source_kind IN ('owner','github','system','external')),
  source_url TEXT NOT NULL DEFAULT '',
  source_status TEXT NOT NULL CHECK(source_status IN ('verified','owner_decision','needs_verification')),
  assignee TEXT NOT NULL CHECK(assignee='human' OR assignee GLOB 'agent:*'),
  privacy_class TEXT NOT NULL DEFAULT 'private' CHECK(privacy_class IN ('private','sensitive','public_meta')),
  status TEXT NOT NULL DEFAULT 'CAPTURED'
    CHECK(status IN ('CAPTURED','READY','ACTIVE','DONE','BLOCKED','PARKED','CANCELLED')),
  priority INTEGER NOT NULL DEFAULT 50 CHECK(priority BETWEEN 0 AND 100),
  review_at TEXT NOT NULL DEFAULT '',
  version INTEGER NOT NULL DEFAULT 1 CHECK(version >= 1),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_transition TEXT NOT NULL DEFAULT ''
);
-- Enforced by SQLite itself, including under simultaneous requests.
CREATE UNIQUE INDEX IF NOT EXISTS one_active_human_command
  ON command_tasks(assignee) WHERE assignee='human' AND status='ACTIVE';
CREATE INDEX IF NOT EXISTS command_ready_rank
  ON command_tasks(assignee,status,priority DESC,created_at,id);
CREATE TABLE IF NOT EXISTS command_history (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES command_tasks(id),
  action TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  evidence TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS command_history_by_task
  ON command_history(task_id,created_at,id);
