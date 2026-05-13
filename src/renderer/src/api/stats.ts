import { fetchJson } from './http'

export type SummaryDto = {
  date: string
  today_code_lines: number
  today_duration_minutes: number
  total_code_lines: number
  total_duration_minutes: number
  streak_days: number
}

export type HeatmapItem = {
  date: string
  code_lines: number
  duration_minutes: number
  intensity: number
}

export type HeatmapDto = { items: HeatmapItem[] }

export function getSummary(params?: { date?: string }): Promise<SummaryDto> {
  const q = new URLSearchParams()
  if (params?.date) q.set('date', params.date)
  const qs = q.toString()
  return fetchJson<SummaryDto>('GET', `/api/summary${qs ? `?${qs}` : ''}`)
}

export function getHeatmap(params: { from: string; to: string }): Promise<HeatmapDto> {
  const q = new URLSearchParams({ from: params.from, to: params.to })
  return fetchJson<HeatmapDto>('GET', `/api/heatmap?${q.toString()}`)
}
