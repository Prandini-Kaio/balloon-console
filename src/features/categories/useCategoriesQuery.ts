import { useQuery } from '@tanstack/react-query'
import { isApiFailure } from '@/core/api/types'
import { listCategorias } from '@/features/categories/categories.api'
import type { CategoryOption } from '@/features/categories/types'

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: async (): Promise<CategoryOption[]> => {
      const res = await listCategorias()
      if (isApiFailure(res)) throw new Error(res.message)
      const rows = res.data ?? []
      return rows.map((r) => ({ id: r.id, nome: r.nome }))
    },
    staleTime: 5 * 60_000,
  })
}
