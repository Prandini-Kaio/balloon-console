import { httpRequest } from '@/core/api/httpClient'
import type { EventoCapaPresignResponse } from '@/features/events/eventMedia.api'

export type DestaqueCampanhaStatus = 'PENDENTE' | 'ATIVA' | 'VENCIDA' | 'CANCELADA'

export type DestaqueCampanha = {
  id: number
  empresaId: number
  empresaNome: string
  regiaoId: number
  regiaoNome: string
  dataInicio: string
  dataFim: string
  status: DestaqueCampanhaStatus
  imageUrl?: string | null
  storageKey?: string | null
  ordem: number
  valorCentavos?: number | null
}

export type DestaqueCampanhaInput = {
  empresaId: number
  regiaoId: number
  dataInicio: string
  dataFim: string
  status?: DestaqueCampanhaStatus
  valorCentavos?: number | null
  imageUrl?: string | null
  storageKey?: string | null
}

export async function listCampanhasDestaque(params?: {
  empresaId?: number
  regiaoId?: number
  status?: DestaqueCampanhaStatus
}) {
  const query: Record<string, string | number> = {}
  if (params?.empresaId != null) query.empresaId = params.empresaId
  if (params?.regiaoId != null) query.regiaoId = params.regiaoId
  if (params?.status) query.status = params.status
  return httpRequest<DestaqueCampanha[]>({ path: '/admin/destaques-app', query })
}

export async function createCampanhaDestaque(body: DestaqueCampanhaInput) {
  return httpRequest<DestaqueCampanha>({
    method: 'POST',
    path: '/admin/destaques-app',
    body,
  })
}

export async function updateCampanhaDestaque(id: number, body: DestaqueCampanhaInput) {
  return httpRequest<DestaqueCampanha>({
    method: 'PUT',
    path: `/admin/destaques-app/${id}`,
    body,
  })
}

export async function deleteCampanhaDestaque(id: number) {
  return httpRequest<null>({
    method: 'DELETE',
    path: `/admin/destaques-app/${id}`,
  })
}

export async function presignCampanhaDestaque(id: number, contentType: string) {
  return httpRequest<EventoCapaPresignResponse>({
    method: 'POST',
    path: `/admin/destaques-app/${id}/presign`,
    body: { contentType },
  })
}

export async function reorderCampanhasDestaque(regiaoId: number, ids: number[]) {
  return httpRequest<null>({
    method: 'PUT',
    path: '/admin/destaques-app/reorder',
    body: { regiaoId, ids },
  })
}
