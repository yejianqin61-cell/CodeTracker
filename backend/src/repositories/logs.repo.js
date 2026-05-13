/**
 * @file `logs` 表数据访问层。
 * @description 仅封装 SQL；列表支持筛选、分页及 `project_name`（见 `backend/docs/api.md`）。
 * @see {@link ../db/schema.sql}
 */

const { getDb } = require('../db')

/**
 * 分页列表：`logs` 左连 `projects` 取名称，按 id 倒序。
 * @param {{ date?: string, project_id?: number, q?: string, page: number, page_size: number }} filters
 */
function listLogs(filters) {
  const db = getDb()
  const conds = []
  const params = []
  if (filters.date) {
    conds.push('logs.date = ?')
    params.push(filters.date)
  }
  if (filters.project_id) {
    conds.push('logs.project_id = ?')
    params.push(filters.project_id)
  }
  if (filters.q) {
    conds.push('logs.note LIKE ?')
    params.push(`%${filters.q}%`)
  }
  const whereSql = conds.length ? `WHERE ${conds.join(' AND ')}` : ''
  const sql = `SELECT logs.id, logs.date, logs.project_id, projects.name AS project_name,
    logs.code_lines, logs.duration_minutes, logs.note, logs.created_at
    FROM logs JOIN projects ON logs.project_id = projects.id
    ${whereSql}
    ORDER BY logs.id DESC
    LIMIT ? OFFSET ?`
  params.push(filters.page_size, (filters.page - 1) * filters.page_size)
  return db.prepare(sql).all(...params)
}

/** 与 {@link listLogs} 相同 WHERE，不含 LIMIT/OFFSET。 */
function countLogs(filters) {
  const db = getDb()
  const conds = []
  const params = []
  if (filters.date) {
    conds.push('logs.date = ?')
    params.push(filters.date)
  }
  if (filters.project_id) {
    conds.push('logs.project_id = ?')
    params.push(filters.project_id)
  }
  if (filters.q) {
    conds.push('logs.note LIKE ?')
    params.push(`%${filters.q}%`)
  }
  const whereSql = conds.length ? `WHERE ${conds.join(' AND ')}` : ''
  const sql = `SELECT COUNT(1) AS cnt
    FROM logs
    ${whereSql}`
  const row = db.prepare(sql).get(...params)
  return row ? Number(row.cnt) : 0
}

/** 按主键取一条（含 `project_name`）。 */
function findById(id) {
  const db = getDb()
  const sql = `SELECT logs.id, date, project_id, projects.name AS project_name,
    code_lines, duration_minutes, note, logs.created_at
    FROM logs JOIN projects ON logs.project_id = projects.id
    WHERE logs.id = ?`
  return db.prepare(sql).get(id)
}

/**
 * 插入一条日志。
 * @returns {number} `lastInsertRowid`
 */
function insert(payload) {
  const db = getDb()
  const sql = `INSERT INTO logs (date, project_id, code_lines, duration_minutes, note)
    VALUES (?, ?, ?, ?, ?)`
  const info = db.prepare(sql).run(
    payload.date,
    payload.project_id,
    payload.code_lines,
    payload.duration_minutes,
    payload.note
  )
  return Number(info.lastInsertRowid)
}

/** 更新指定行；返回 `changes`（0 表示未更新）。 */
function update(id, payload) {
  const db = getDb()
  const sql = `UPDATE logs SET date = ?, project_id = ?, code_lines = ?, duration_minutes = ?, note = ?
    WHERE id = ?`
  const info = db.prepare(sql).run(
    payload.date,
    payload.project_id,
    payload.code_lines,
    payload.duration_minutes,
    payload.note,
    id
  )
  return info.changes
}

/** 按主键删除；返回 `changes`。 */
function deleteById(id) {
  const db = getDb()
  const info = db.prepare('DELETE FROM logs WHERE id = ?').run(id)
  return info.changes
}

/** 按可选 `date` 过滤，汇总行数与时长（供 summary / 统计）。 */
function aggregateLogs(filters) {
  const db = getDb()
  const where = []
  const params = []
  if (filters && filters.date) {
    where.push('date = ?')
    params.push(filters.date)
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const sql = `SELECT
      COALESCE(SUM(code_lines), 0) AS code_lines,
      COALESCE(SUM(duration_minutes), 0) AS duration_minutes
    FROM logs
    ${whereSql}`
  const row = db.prepare(sql).get(...params)
  return {
    code_lines: row ? Number(row.code_lines) : 0,
    duration_minutes: row ? Number(row.duration_minutes) : 0
  }
}

/** 闭区间 `[from, to]` 内按日历日聚合。 */
function aggregateLogsByDate(range) {
  const db = getDb()
  const sql = `SELECT
      date,
      COALESCE(SUM(code_lines), 0) AS code_lines,
      COALESCE(SUM(duration_minutes), 0) AS duration_minutes
    FROM logs
    WHERE date >= ? AND date <= ?
    GROUP BY date
    ORDER BY date ASC`
  return db.prepare(sql).all(range.from, range.to)
}

/**
 * 从给定 `date` 起连续有记录的天数（按 UTC 日历日递减）。
 * @param {string} date `YYYY-MM-DD`
 */
function countStreakDays(date) {
  const db = getDb()
  const rows = db
    .prepare(`SELECT DISTINCT date FROM logs WHERE date <= ? ORDER BY date DESC`)
    .all(date)
    .map((r) => r.date)
  let streak = 0
  let cursor = date
  const set = new Set(rows)
  while (set.has(cursor)) {
    streak += 1
    const d = new Date(cursor + 'T00:00:00Z')
    d.setUTCDate(d.getUTCDate() - 1)
    cursor = d.toISOString().slice(0, 10)
  }
  return streak
}

module.exports = {
  listLogs,
  countLogs,
  findById,
  insert,
  update,
  deleteById,
  aggregateLogs,
  aggregateLogsByDate,
  countStreakDays
}
