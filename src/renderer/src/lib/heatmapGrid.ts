import { addUtcDays, formatUtcYmd, parseUtcYmd } from './dates'

export type HeatmapCell = {
  dateStr: string
  inRange: boolean
  /** 0–4；区间外为 -1（仅用于样式：不展示贡献色） */
  intensity: number
  code_lines: number
  duration_minutes: number
}

export type HeatmapItemLike = {
  date: string
  intensity: number
  code_lines: number
  duration_minutes: number
}

/**
 * GitHub 风格：每列一周，列内自上而下为「周日→周六」。
 * 区间外格子 `inRange === false`，不参与强度着色。
 */
export function buildGithubStyleColumns(
  from: string,
  to: string,
  items: HeatmapItemLike[],
): HeatmapCell[][] {
  const intensityMap = new Map<string, number>()
  const linesMap = new Map<string, number>()
  const durMap = new Map<string, number>()
  for (const it of items) {
    intensityMap.set(it.date, it.intensity)
    linesMap.set(it.date, it.code_lines)
    durMap.set(it.date, it.duration_minutes)
  }

  const start = parseUtcYmd(from)
  const gridStart = addUtcDays(start, -start.getUTCDay())

  const columns: HeatmapCell[][] = []
  let weekStart = new Date(gridStart.getTime())

  for (;;) {
    const col: HeatmapCell[] = []
    for (let dow = 0; dow < 7; dow++) {
      const cellDate = addUtcDays(weekStart, dow)
      const dateStr = formatUtcYmd(cellDate)
      const inRange = dateStr >= from && dateStr <= to
      const intensity = inRange ? intensityMap.get(dateStr) ?? 0 : -1
      col.push({
        dateStr,
        inRange,
        intensity,
        code_lines: inRange ? linesMap.get(dateStr) ?? 0 : 0,
        duration_minutes: inRange ? durMap.get(dateStr) ?? 0 : 0,
      })
    }
    columns.push(col)
    const saturday = addUtcDays(weekStart, 6)
    const saturdayStr = formatUtcYmd(saturday)
    if (saturdayStr >= to) break
    weekStart = addUtcDays(weekStart, 7)
  }

  return columns
}

/** Tailwind 类名须为静态完整字符串，以便构建时扫描。 */
export function intensityClass(level: number, inRange: boolean): string {
  if (!inRange) {
    return 'border border-transparent bg-white/[0.015] opacity-40'
  }
  if (level <= 0) {
    return 'border border-white/[0.07] bg-violet-500/[0.07] shadow-none'
  }
  if (level === 1) {
    return 'border border-cyan-400/25 bg-gradient-to-br from-cyan-500/30 to-emerald-600/10 shadow-[0_0_12px_-4px_rgba(34,211,238,0.35)]'
  }
  if (level === 2) {
    return 'border border-emerald-400/30 bg-gradient-to-br from-emerald-400/35 to-cyan-500/15 shadow-[0_0_14px_-3px_rgba(52,211,153,0.4)]'
  }
  if (level === 3) {
    return 'border border-emerald-300/35 bg-gradient-to-br from-emerald-300/45 to-teal-500/25 shadow-[0_0_18px_-2px_rgba(16,185,129,0.45)]'
  }
  return 'border border-white/20 bg-gradient-to-br from-cyan-300/50 via-emerald-400/45 to-violet-400/35 shadow-[0_0_22px_0_rgba(34,211,238,0.35)]'
}
