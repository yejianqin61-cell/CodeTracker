-- CodeTracker MVP — SQLite DDL（由 db/index.js exec）

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_name ON projects (name);

CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  project_id INTEGER NOT NULL,
  code_lines INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects (id)
);

CREATE INDEX IF NOT EXISTS idx_logs_date ON logs (date);
CREATE INDEX IF NOT EXISTS idx_logs_project_id ON logs (project_id);
