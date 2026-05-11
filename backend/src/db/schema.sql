-- CodeTracker MVP — SQLite DDL
-- 约定：与 PRD「核心数据对象」一致；由 db/index.js 在启动时整体 exec。

-- 项目表：日志通过 project_id 关联
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 项目名唯一，避免下拉列表里出现重复名称（可按产品需要改为非唯一）
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_name ON projects (name);

-- 开发日志表
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
