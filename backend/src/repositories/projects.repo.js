/**
 * @file `projects` 表数据访问层。
 * @description
 * 仅封装 SQL 与 better-sqlite3 调用；不包含 HTTP 与业务规则（见 `services/projects.service.js`）。
 * @see {@link ../db/schema.sql} 表定义
 */

const { getDb } = require('../db')

/**
 * 列出全部项目，按主键倒序（新创建在前）。
 * @returns {Array<{ id: number, name: string, created_at: string }>}
 */
function listAll() {
  const db = getDb()
  return db
    .prepare(
      `SELECT id, name, created_at
       FROM projects
       ORDER BY id DESC`
    )
    .all()
}

/**
 * 按名称精确匹配一条（用于唯一性校验）。
 * @param {string} name
 * @returns {{ id: number } | undefined}
 */
function findByName(name) {
  const db = getDb()
  return db.prepare('SELECT id FROM projects WHERE name = ?').get(name)
}

/**
 * 插入一条项目记录。
 * @param {string} name
 * @returns {number} `lastInsertRowid`
 */
function insert(name) {
  const db = getDb()
  const info = db.prepare('INSERT INTO projects (name) VALUES (?)').run(name)
  return Number(info.lastInsertRowid)
}

module.exports = {
  listAll,
  findByName,
  insert
}
