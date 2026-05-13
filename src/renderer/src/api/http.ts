/**
 * 渲染进程访问本地 Express `/api` 的轻量封装。
 */

export function getBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE
  const s = typeof raw === 'string' ? raw.trim() : ''
  return s || 'http://127.0.0.1:3033'
}

export type ApiErrorBody = {
  error?: { code?: string; message?: string }
}

export class ApiRequestError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, message: string, body: unknown) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.body = body
  }

  apiMessage(): string {
    const b = this.body as ApiErrorBody | null
    const m = b?.error?.message
    return typeof m === 'string' && m.length > 0 ? m : this.message
  }
}

export async function fetchJson<T>(
  method: string,
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  const base = getBaseUrl().replace(/\/$/, '')
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`
  const { json: jsonPayload, ...restInit } = init ?? {}
  const headers = new Headers(restInit.headers)
  const rawBody = restInit.body
  let body: BodyInit | undefined =
    rawBody === null || rawBody === undefined ? undefined : rawBody
  if (jsonPayload !== undefined) {
    headers.set('content-type', 'application/json')
    body = JSON.stringify(jsonPayload)
  }
  const res = await fetch(url, { ...restInit, method, headers, body })
  const text = await res.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text) as unknown
    } catch {
      throw new ApiRequestError(res.status, `Invalid JSON (${res.status})`, text)
    }
  }
  if (!res.ok) {
    throw new ApiRequestError(res.status, `HTTP ${res.status}`, data)
  }
  return data as T
}
