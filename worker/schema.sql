CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,
  mode TEXT,
  kind TEXT,
  template TEXT NOT NULL,
  question TEXT,
  vote INTEGER NOT NULL,
  answer TEXT
);
CREATE INDEX IF NOT EXISTS feedback_template ON feedback (template);
