import { httpRequest } from '@/core/api/httpClient'
import type { EventoInputBody, EventoListFilter, EventoOutput, SpringPage } from '@/features/events/types'

export async function fetchEventosPage(
  filter: EventoListFilter,
  page: number,
  size: number,
) {
  const query: Record<string, string | number | undefined> = {
    page,
    size,
    sort: 'dataInicio,desc',
  }
  if (filter.nome) query.nome = filter.nome
  if (filter.categoria) query.categoria = filter.categoria
  if (filter.status) query.status = filter.status
  if (filter.tipoEvento) query.tipoEvento = filter.tipoEvento
  if (filter.dataInicio) query.dataInicio = filter.dataInicio
  if (filter.dataFim) query.dataFim = filter.dataFim
  if (filter.empresaId != null) query.empresaId = filter.empresaId
  return httpRequest<SpringPage<EventoOutput>>({
    path: '/evento',
    query,
  })
}

export async function fetchEventoById(id: number) {
  return httpRequest<EventoOutput>({ path: `/evento/${id}` })
}

export async function createEvento(body: EventoInputBody) {
  return httpRequest<EventoOutput>({
    method: 'POST',
    path: '/evento',
    body,
  })
}

export async function updateEvento(id: number, body: EventoInputBody) {
  return httpRequest<EventoOutput>({
    method: 'PUT',
    path: `/evento/${id}`,
    body,
  })
}

export async function deleteEvento(id: number) {
  return httpRequest<null>({
    method: 'DELETE',
    path: `/evento/${id}`,
  })
}
