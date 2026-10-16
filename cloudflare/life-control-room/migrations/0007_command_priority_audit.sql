-- Additive audit snapshots. Historical unknown values remain NULL; never infer past rank.
-- History id is the transition UUID also stored in command_tasks.last_transition.
ALTER TABLE command_history ADD COLUMN previous_priority INTEGER CHECK(previous_priority BETWEEN 0 AND 100);
ALTER TABLE command_history ADD COLUMN resulting_priority INTEGER CHECK(resulting_priority BETWEEN 0 AND 100);
ALTER TABLE command_history ADD COLUMN task_version INTEGER CHECK(task_version >= 1);
