/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_CATEGORIES_JSON: string
  readonly VITE_COMPANIES_USE_HTTP: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
