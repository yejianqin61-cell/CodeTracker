/**
 * @file Stats 领域服务：summary 与 heatmap 聚合。
 * @description 复用 `logs.repo` 聚合查询；heatmap 的 `intensity` 为 0–4，供前端映射颜色。
 */

const { HttpError } = require('../utils/http')
const logsRepo = require('../repositories/logs.repo')
const { isYyyyMmDd, parseDateRange, todayYyyyMmDd } = require('../utils/date')

/**
 * 单日汇总 + 全量累计 + 连续打卡天数。
 * @param {Record<string, unknown>} query
 */
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
  const todayAgg = logsRepo.aggregateLogs({ date })
  const totalAgg = logsRepo.aggregateLogs({})
  const streakDays = logsRepo.countStreakDays(date)
  return {
    date,
    today_code_lines: todayAgg.code_lines ?? 0,
    today_duration_minutes: todayAgg.duration_minutes ?? 0,
    total_code_lines: totalAgg.code_lines ?? 0,
    total_duration_minutes: totalAgg.duration_minutes ?? 0,
    streak_days: streakDays
  }
}

/**
 * 区间内按日聚合，并计算相对强度档位。
 * @param {Record<string, unknown>} query
 */
async function getHeatmap(query) {
  const from = query && query.from
  const to = query && query.to
  if (!from || !to) {
    throw new HttpError(400, 'BAD_REQUEST', 'from and to are required')
  }
  const { from: f, to: t } = parseDateRange(String(from), String(to))
  const rawItems = logsRepo.aggregateLogsByDate({ from: f, to: t })
  const maxCodeLines = Math.max(0, ...rawItems.map((item) => Number(item.code_lines) || 0))
  const maxDurationMinutes = Math.max(
    0,
    ...rawItems.map((item) => Number(item.duration_minutes) || 0)
  )

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

module.exports = { getSummary, getHeatmap }
