/**
 * @file 日期字符串工具（`YYYY-MM-DD`），与 API 文档中的 `date` / `from` / `to` 约定一致。
 * @description 使用 UTC 日历日解析，避免 `new Date('YYYY-MM-DD')` 在部分环境下的本地时区偏移。
 */

const { HttpError } = require('./http')

/** 校验是否为合法公历日历日字符串。 */
function isYyyyMmDd(value) {
  if (typeof value !== 'string') return false
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [y, m, d] = value.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
}

/**
 * 校验闭区间端点格式及 `from <= to`。
 * @returns {{ from: string, to: string }}
 */
function parseDateRange(from, to) {
  if (!isYyyyMmDd(from) || !isYyyyMmDd(to)) {
    throw new HttpError(400, 'BAD_REQUEST', 'from/to must be in YYYY-MM-DD format')
  }
  if (from > to) {
    throw new HttpError(400, 'BAD_REQUEST', 'from cannot be greater than to')
  }
  return { from, to }
}

/** 当前 UTC 日历日，供 summary 默认日期。 */
function todayYyyyMmDd() {
  const d = new Date()
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

module.exports = { isYyyyMmDd, parseDateRange, todayYyyyMmDd }
