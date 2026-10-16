-- Additive only. Refresh tokens are AES-GCM ciphertext, never raw tokens.
-- OAuth state is single-use and expires after ten minutes.
CREATE TABLE IF NOT EXISTS backup_oauth_states (
  state_hash TEXT PRIMARY KEY,
  browser_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS backup_oauth_connection (
  id TEXT PRIMARY KEY CHECK(id = 'drive'),
  account_id TEXT NOT NULL,
  sealed_refresh_token TEXT NOT NULL,
  verified_at TEXT NOT NULL
);
