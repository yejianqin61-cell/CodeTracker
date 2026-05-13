/**
 * @file Stats 领域服务：summary / heatmap 聚合逻辑。
 * @description
 * - 输入为 query（字符串），输出为 `backend/docs/api.md` §5 约定的 JSON。
 * - 建议复用 `repositories/logs.repo.js` 的聚合查询（或你也可以在这里写 SQL，但建议 SQL 下沉 repo）。
 * - intensity 建议后端定稿为 0-4（前端只做颜色映射）。
 *
 * 【注释规范】参考答案只在 `//` 注释；手写区留空由你写。
 */

// ════════════════════════════════════════════════════════════════════
// 段落 1 — 参考答案：依赖
// ════════════════════════════════════════════════════════════════════
// const { HttpError } = require('../utils/http')
// const logsRepo = require('../repositories/logs.repo')
// （可选）const { isYyyyMmDd } = require('../utils/date')

// ────────────────────────────────────────────────────────────────────
// 手写区 1：依赖
// ────────────────────────────────────────────────────────────────────

const { HttpError } = require('../utils/http')
const logsRepo = require('../repositories/logs.repo')
const { isYyyyMmDd, parseDateRange, todayYyyyMmDd } = require('../utils/date')

// ════════════════════════════════════════════════════════════════════
// 段落 2 — 参考答案：getSummary(query)
// ════════════════════════════════════════════════════════════════════
// 输出（api.md §5.1）：
// {
//   date,
//   today_code_lines, 
//   today_duration_minutes,
//   total_code_lines,
//   total_duration_minutes,
//   streak_days
// }
//
// async function getSummary(query) {
//   // 1) 解析 date（可选；默认今天）
//   // 2) 查当天聚合、总聚合
//   // 3) 计算 streak_days
// }

// ────────────────────────────────────────────────────────────────────
// 手写区 2：getSummary
// ────────────────────────────────────────────────────────────────────

async function getSummary(query) {
    let date
    const raw = query && query.date
    if (raw !== undefined && raw !== null && String(raw).trim() !== '') {
        const s = String(raw).trim()
        if (!isYyyyMmDd(s)) {
            throw new HttpError(400, 'BAD_REQUEST', 'date must be in YYYY-MM-DD format')
        }
        date = s
    } else {
        date = todayYyyyMmDd()
    }
    const todayAgg=logsRepo.aggregateLogs({ date })
    const totalAgg=logsRepo.aggregateLogs({})
    const streakDays=logsRepo.countStreakDays(date)
    return {
        date,
        today_code_lines:todayAgg.code_lines ?? 0,
        today_duration_minutes:todayAgg.duration_minutes ?? 0,
        total_code_lines:totalAgg.code_lines ?? 0,
        total_duration_minutes:totalAgg.duration_minutes ?? 0,
        streak_days:streakDays
    }
}

// ════════════════════════════════════════════════════════════════════
// 段落 3 — 参考答案：getHeatmap(query)
// ════════════════════════════════════════════════════════════════════
// 输入：from/to 必填；校验 YYYY-MM-DD 且 from <= to
// 输出：{ items: [{ date, code_lines, duration_minutes, intensity }] }
//
// async function getHeatmap(query) {
//   // 1) 校验 from/to
//   // 2) repo 按日聚合 SUM(code_lines), SUM(duration_minutes)
//   // 3) intensity 算法（0-4）
// }

// ────────────────────────────────────────────────────────────────────
// 手写区 3：getHeatmap
// ────────────────────────────────────────────────────────────────────

async function getHeatmap(query) {
    const from = query && query.from
    const to = query && query.to
    if (!from || !to) {
        throw new HttpError(400, 'BAD_REQUEST', 'from and to are required')
    }
    const { from: f, to: t } = parseDateRange(String(from), String(to))
    const rawItems = logsRepo.aggregateLogsByDate({ from: f, to: t })
    const maxCodeLines=Math.max(0, ...rawItems.map(item=>Number(item.code_lines)||0))
    const maxDurationMinutes=Math.max(0, ...rawItems.map(item=>Number(item.duration_minutes)||0))

    const items = rawItems.map((item) => {
      const code = Number(item.code_lines) || 0
      const dur = Number(item.duration_minutes) || 0
      const normCode = maxCodeLines ? code / maxCodeLines : 0
      const normDur = maxDurationMinutes ? dur / maxDurationMinutes : 0
      const score = Math.max(normCode, normDur)
      const intensity = score <= 0 ? 0 : Math.min(4, Math.max(1, Math.ceil(score * 4)))
      return { ...item, code_lines: code, duration_minutes: dur, intensity }
    })

    return { items }
}

// ════════════════════════════════════════════════════════════════════
// 段落 4 — 参考答案：导出
// ════════════════════════════════════════════════════════════════════
// module.exports = { getSummary, getHeatmap }

// ────────────────────────────────────────────────────────────────────
// 手写区 4：导出
// ────────────────────────────────────────────────────────────────────
module.exports={getSummary,getHeatmap}
