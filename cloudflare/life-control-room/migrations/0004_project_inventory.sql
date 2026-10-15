-- Private portfolio inventory for Studio.
-- Names of private repositories/projects are data, never seeded in the public repository.
CREATE TABLE IF NOT EXISTS project_inventory (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK(kind IN ('project','system','tool','incubation','archive','repository')),
  status TEXT NOT NULL CHECK(status IN ('active','building','live','paused','incubating','legacy','unknown')),
  category TEXT NOT NULL DEFAULT '',
  repository TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  visibility TEXT NOT NULL CHECK(visibility IN ('public','private','none','unknown')),
  source TEXT NOT NULL CHECK(source IN ('github','memory','canonical','derived')),
  source_status TEXT NOT NULL CHECK(source_status IN ('verified','remembered','needs_verification')),
  observed_at TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS project_inventory_kind ON project_inventory(kind,name);
CREATE INDEX IF NOT EXISTS project_inventory_status ON project_inventory(status,name);
CREATE INDEX IF NOT EXISTS project_inventory_source ON project_inventory(source,source_status);
