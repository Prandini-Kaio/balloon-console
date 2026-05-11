import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isApiFailure } from '@/core/api/types'
import { createEvento, deleteEvento, updateEvento } from '@/features/events/events.api'
import type { EventoInputBody } from '@/features/events/types'

export function useCreateEventMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: EventoInputBody) => {
      const res = await createEvento(body)
      if (isApiFailure(res)) throw new Error(res.message)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })
}

export function useUpdateEventMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id: number; body: EventoInputBody }) => {
      const res = await updateEvento(id, body)
      if (isApiFailure(res)) throw new Error(res.message)
      return res.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })
}

export function useDeleteEventMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await deleteEvento(id)
      if (isApiFailure(res)) throw new Error(res.message)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })
}
