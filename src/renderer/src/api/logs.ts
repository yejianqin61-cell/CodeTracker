import { fetchJson } from './http'

export type LogItemDto = {
  id: number
  date: string
  project_id: number
  project_name?: string
  code_lines: number
  duration_minutes: number
  note: string
  created_at: string
}

export type LogsListDto = {
  items: LogItemDto[]
  page: number
  page_size: number
  total: number
}

export type LogWriteBody = {
  date: string
  project_id: number
  code_lines: number
  duration_minutes: number
  note?: string
}

export function listLogs(params?: {
  date?: string
  project_id?: number
  q?: string
  page?: number
  page_size?: number
}): Promise<LogsListDto> {
  const q = new URLSearchParams()
  if (params?.date) q.set('date', params.date)
  if (params?.project_id != null) q.set('project_id', String(params.project_id))
  if (params?.q) q.set('q', params.q)
  if (params?.page != null) q.set('page', String(params.page))
  if (params?.page_size != null) q.set('page_size', String(params.page_size))
  const qs = q.toString()
  return fetchJson<LogsListDto>('GET', `/api/logs${qs ? `?${qs}` : ''}`)
}

export function createLog(body: LogWriteBody): Promise<{ id: number }> {
  return fetchJson<{ id: number }>('POST', '/api/logs', { json: body })
}

export function updateLog(id: number, body: LogWriteBody): Promise<{ ok: boolean }> {
  return fetchJson<{ ok: boolean }>('PUT', `/api/logs/${id}`, { json: body })
}

export function deleteLog(id: number): Promise<{ ok: boolean }> {
  return fetchJson<{ ok: boolean }>('DELETE', `/api/logs/${id}`)
}
