/** 与后端 `utils/date.js` 一致：按 UTC 日历日解析 `YYYY-MM-DD`。 */
export function parseUtcYmd(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

export function formatUtcYmd(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addUtcDays(d: Date, n: number): Date {
  const x = new Date(d.getTime())
  x.setUTCDate(x.getUTCDate() + n)
  return x
}

/** 返回「今天」UTC 的 YYYY-MM-DD（与后端 `todayYyyyMmDd` 对齐）。 */
export function todayUtcYmd(): string {
  return formatUtcYmd(new Date())
}

/** 热力图最早展示的自然年（与产品约定一致，不展示更早数据）。 */
export const HEATMAP_FIRST_YEAR = 2026

export function utcCalendarYear(): number {
  return new Date().getUTCFullYear()
}

/**
 * 按「自然年（UTC）」截取 GitHub 风格热力图区间：不早于 2026-01-01，不晚于今天；
 * 历史整年用该年 12-31 结束。
 */
export function heatmapYearBoundsUtc(displayYear: number): { from: string; to: string } {
  const today = todayUtcYmd()
  const yNow = utcCalendarYear()
  const y = Math.max(HEATMAP_FIRST_YEAR, Math.min(displayYear, yNow))
  const from = `${y}-01-01`
  const dec31 = `${y}-12-31`
  let to: string
  if (y < yNow) {
    to = dec31
  } else {
    to = today
  }
  if (from > to) {
    return { from, to: dec31 }
  }
  return { from, to }
}

/** 从 `from` 起向过去数 `daysBack` 天（含边界），返回 YYYY-MM-DD。 */
export function shiftYmd(from: string, daysBack: number): string {
  const d = addUtcDays(parseUtcYmd(from), -daysBack)
  return formatUtcYmd(d)
}

