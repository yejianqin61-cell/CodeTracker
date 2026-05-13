/**
 * @file `logs` 表数据访问层。
 * @description
 * 仅 SQL / `getDb()`；列表需支持筛选、分页与 `project_name`（见 `docs/api.md` §4.1）。
 * 实现顺序建议：count + list → insert → update → delete →（可选）按日聚合给 stats 复用。
 *
 * 【注释规范】与 `.cursor/rules/comment-handwrite-teaching.mdc` 一致：
 * 每段 `// ═══ … 参考答案` 仅含**注释内**示例；`// ─── 手写区` 下留空，由你亲自写代码。
 */

// ════════════════════════════════════════════════════════════════════
// 段落 1 — 参考答案：依赖
// ════════════════════════════════════════════════════════════════════
// const { getDb } = require('../db')

// ────────────────────────────────────────────────────────────────────
// 手写区 1：依赖
// ────────────────────────────────────────────────────────────────────

const {getDb}=require('../db')

// ════════════════════════════════════════════════════════════════════
// 段落 2 — 参考答案：listLogs(filters, pagination)
// ════════════════════════════════════════════════════════════════════
// filters: { date?: string, project_id?: number, q?: string }
// pagination: { page: number, page_size: number }
// SQL 思路：FROM logs JOIN projects ON … WHERE 动态条件；COUNT(*) 子查询或两次查询；
// SELECT 字段须含 id, date, project_id, project_name, code_lines, duration_minutes, note, created_at
// LIMIT / OFFSET 由 page、page_size 计算（page 从 1 开始）

// ────────────────────────────────────────────────────────────────────
// 手写区 2：listLogs
// ────────────────────────────────────────────────────────────────────

function listLogs(filters){
    const db=getDb()
    const conds=[]
    const params=[]
    if(filters.date){
        conds.push('logs.date = ?')
        params.push(filters.date)
    }
    if(filters.project_id){
        conds.push('logs.project_id = ?')
        params.push(filters.project_id)
    }
    if(filters.q){
        conds.push('logs.note LIKE ?')
        params.push(`%${filters.q}%`)
    }
    const whereSql = conds.length ? `WHERE ${conds.join(' AND ')}` : ''
    const sql=`SELECT logs.id, logs.date, logs.project_id, projects.name AS project_name,
    logs.code_lines, logs.duration_minutes, logs.note, logs.created_at
    FROM logs JOIN projects ON logs.project_id = projects.id
    ${whereSql}
    ORDER BY logs.id DESC
    LIMIT ? OFFSET ?`
    params.push(filters.page_size, (filters.page - 1) * filters.page_size)
    return db.prepare(sql).all(...params)
}

// ════════════════════════════════════════════════════════════════════
// 段落 3 — 参考答案：countLogs(filters) — 与 list 同条件，不含分页
// ════════════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────────
// 手写区 3：countLogs（可与 listLogs 合并为一个函数返回 { items, total }，按你喜好）
// ────────────────────────────────────────────────────────────────────



// ════════════════════════════════════════════════════════════════════
// 段落 4 — 参考答案：findById(id)
// ════════════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────────
// 手写区 4：findById
// ────────────────────────────────────────────────────────────────────
function countLogs(filters){
    const db=getDb()
    const conds=[]
    const params=[]
    if(filters.date){
        conds.push('logs.date = ?')
        params.push(filters.date)
    }
    if(filters.project_id){
        conds.push('logs.project_id = ?')
        params.push(filters.project_id)
    }
    if(filters.q){
        conds.push('logs.note LIKE ?')
        params.push(`%${filters.q}%`)
    }
    const whereSql = conds.length ? `WHERE ${conds.join(' AND ')}` : ''
    const sql=`SELECT COUNT(1) AS cnt
    FROM logs
    ${whereSql}`
    const row=db.prepare(sql).get(...params)
    return row ? Number(row.cnt) : 0
}

function findById(id){
    const db=getDb()
    const sql=`SELECT logs.id,date,project_id,projects.name AS project_name,
    code_lines,duration_minutes, note,logs.created_at
    FROM logs JOIN projects ON logs.project_id=projects.id
    WHERE logs.id=?`
    return db.prepare(sql).get(id)

}


// ════════════════════════════════════════════════════════════════════
// 段落 5 — 参考答案：insert(payload) → lastInsertRowid
// ════════════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────────
// 手写区 5：insert
// ────────────────────────────────────────────────────────────────────

function insert(payload){
    const db=getDb()
    const sql=`INSERT INTO logs (date, project_id, code_lines, duration_minutes, note)
    VALUES (?, ?, ?, ?, ?)`
    const info=db.prepare(sql).run(payload.date,payload.project_id,payload.code_lines,
        payload.duration_minutes,payload.note)
        return Number(info.lastInsertRowid)

}

// ════════════════════════════════════════════════════════════════════
// 段落 6 — 参考答案：update(id, payload) — 行不存在时让上层感知（返回 changes 或先 SELECT）
// ════════════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────────
// 手写区 6：update
// ────────────────────────────────────────────────────────────────────
function update(id,payload){
    const db=getDb()
    const sql=`UPDATE logs SET date=?,project_id=?,code_lines=?,duration_minutes=?,note=?
    WHERE id=?`
    const info=db.prepare(sql).run(payload.date,payload.project_id,payload.code_lines,
        payload.duration_minutes,payload.note,id)
        return info.changes

    
}


// ════════════════════════════════════════════════════════════════════
// 段落 7 — 参考答案：deleteById(id)
// ════════════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────────
// 手写区 7：deleteById
// ────────────────────────────────────────────────────────────────────

function deleteById(id){
    const db=getDb()
    const sql=`DELETE FROM logs WHERE id=?`
    const info=db.prepare(sql).run(id)
    return info.changes
}

// stats 用：summary / heatmap 聚合查询
function aggregateLogs(filters){
    const db = getDb()
    const where = []
    const params = []
    if (filters && filters.date) {
        where.push('date=?')
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

function aggregateLogsByDate(range){
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

function countStreakDays(date){
    const db = getDb()
    const rows = db
      .prepare(`SELECT DISTINCT date FROM logs WHERE date <= ? ORDER BY date DESC`)
      .all(date)
      .map(r => r.date)
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

// ════════════════════════════════════════════════════════════════════
// 段落 8 — 参考答案：module.exports
// ════════════════════════════════════

// ────────────────────────────────────────────────────────────────────
// 手写区 8：导出
// ────────────────────────────────────────────────────────────────────

module.exports={listLogs,countLogs,findById,insert,update,deleteById,aggregateLogs,aggregateLogsByDate,countStreakDays}


