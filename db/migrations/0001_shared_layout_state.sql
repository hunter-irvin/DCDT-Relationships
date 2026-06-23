CREATE TABLE IF NOT EXISTS shared_layout_state (
  id TEXT PRIMARY KEY,
  layout_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
