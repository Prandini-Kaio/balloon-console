import { useQuery } from '@tanstack/react-query'
import { isApiFailure } from '@/core/api/types'
import { fetchEventosPage } from '@/features/events/events.api'
import type { EventoListFilter } from '@/features/events/types'

export function useEventsPageQuery(filter: EventoListFilter, page: number, size: number) {
  return useQuery({
    queryKey: ['events', filter, page, size],
    queryFn: async () => {
      const res = await fetchEventosPage(filter, page, size)
      if (isApiFailure(res)) throw new Error(res.message)
      return res.data
    },
  })
}
