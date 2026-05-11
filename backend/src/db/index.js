/**
 * @file SQLite 连接与启动期 DDL 执行。
 * @description
 * - 在进程启动时打开（或创建）数据库文件，并执行同目录 `schema.sql`。
 * - 业务查询请放在 `repositories/`，本文件只负责连接生命周期与建表。
 *
 * @see {@link ./schema.sql}
 */

const fs = require('fs')
const path = require('path')
const Database = require('better-sqlite3')

/** @type {import('better-sqlite3').Database | null} */
let db = null

/**
 * 初始化数据库：解析路径、打开库、执行 schema、开启外键。
 * @param {string} dbPath 来自 `config/env.js`（可为相对路径，相对 `process.cwd()`）
 * @returns {Promise<void>}
 */
async function initDb(dbPath) {
  const resolved = path.isAbsolute(dbPath)
    ? dbPath
    : path.resolve(process.cwd(), dbPath)

  db = new Database(resolved)

  const schemaPath = path.join(__dirname, 'schema.sql')
  const ddl = fs.readFileSync(schemaPath, 'utf8')
  db.exec(ddl)

  db.pragma('foreign_keys = ON')
}

/**
 * 供 repositories 获取同一连接实例。
 * @returns {import('better-sqlite3').Database}
 */
function getDb() {
  if (!db) {
    throw new Error('数据库未初始化：请先调用 initDb(dbPath) 且成功返回')
  }
  return db
}

/**
 * 关闭连接（供进程信号优雅退出时调用）。
 * @returns {Promise<void>}
 */
async function close() {
  if (db) {
    db.close()
    db = null
  }
}

module.exports = {
  initDb,
  close,
  getDb
}
