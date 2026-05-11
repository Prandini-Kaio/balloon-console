const defaultBase = 'https://balloon-backend-ukgk.onrender.com/api/v1'

export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim()
  if (!raw) return defaultBase
  return raw.replace(/\/$/, '')
}

export function getCategoriesJson(): string {
  return import.meta.env.VITE_CATEGORIES_JSON?.trim() ?? ''
}

export function companiesUseHttp(): boolean {
  return import.meta.env.VITE_COMPANIES_USE_HTTP === 'true'
}
