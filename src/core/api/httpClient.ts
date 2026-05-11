import { getApiBaseUrl } from '@/core/config/env'
import type { ApiResult } from '@/core/api/types'
import { emitAuthLogout } from '@/core/api/authEvents'
import { getStoredToken } from '@/core/auth/tokenStorage'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export type HttpRequestOptions = {
  method?: HttpMethod
  path: string
  query?: Record<string, string | number | boolean | undefined | null>
  body?: unknown
  skipAuth?: boolean
  skipUnauthorizedRedirect?: boolean
}

function buildUrl(path: string, query?: HttpRequestOptions['query']): string {
  const base = getApiBaseUrl().replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  let url = `${base}${p}`
  if (query) {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === '') continue
      params.set(k, String(v))
    }
    const qs = params.toString()
    if (qs) url += `?${qs}`
  }
  return url
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

export async function httpRequest<T>(options: HttpRequestOptions): Promise<ApiResult<T>> {
  const { method = 'GET', path, query, body, skipAuth, skipUnauthorizedRedirect } = options
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }
  const token = skipAuth ? null : getStoredToken()
  if (token) headers.Authorization = `Bearer ${token}`
  let payload: string | undefined
  if (body !== undefined && method !== 'GET') {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }
  let response: Response
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: payload,
    })
  } catch {
    return { ok: false, status: 0, message: 'Falha de rede' }
  }
  const parsed = await parseBody(response)
  if (response.status === 401 && !skipUnauthorizedRedirect && getStoredToken()) {
    emitAuthLogout()
  }
  if (!response.ok) {
    const message =
      typeof parsed === 'object' && parsed !== null && 'message' in parsed
        ? String((parsed as { message?: unknown }).message ?? response.statusText)
        : response.statusText || 'Erro na requisição'
    return { ok: false, status: response.status, message, body: parsed }
  }
  return { ok: true, data: parsed as T, status: response.status }
}
