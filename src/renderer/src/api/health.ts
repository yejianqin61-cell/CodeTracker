import { fetchJson } from './http'

export type HealthDto = {
  ok: boolean
  service?: string
  time?: string
}

export function getHealth(): Promise<HealthDto> {
  return fetchJson<HealthDto>('GET', '/api/health')
}
