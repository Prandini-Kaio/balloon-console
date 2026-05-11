import { useMemo } from 'react'
import { getCategoriesJson } from '@/core/config/env'

export type CategoryOption = { id: number; nome: string }

function parseEnvCategories(): CategoryOption[] {
  const raw = getCategoriesJson()
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((item) => {
        if (!item || typeof item !== 'object') return null
        const o = item as Record<string, unknown>
        const id = Number(o.id)
        const nome = typeof o.nome === 'string' ? o.nome : ''
        if (!Number.isFinite(id) || id <= 0 || !nome) return null
        return { id, nome }
      })
      .filter((x): x is CategoryOption => x !== null)
  } catch {
    return []
  }
}

export function useCategoryOptions(): CategoryOption[] {
  return useMemo(() => parseEnvCategories(), [])
}
