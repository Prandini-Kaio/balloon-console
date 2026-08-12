import { httpRequest } from '@/core/api/httpClient'

export type RegiaoDestaque = {
  id: number
  nome: string
  cidade?: string | null
  estado?: string | null
  latitude: number
  longitude: number
  raioKm: number
  ativo: boolean
}

export type RegiaoDestaqueInput = {
  nome: string
  cidade?: string
  estado?: string
  latitude: number
  longitude: number
  raioKm: number
  ativo?: boolean
}

export async function listRegioesDestaque(apenasAtivas = false) {
  return httpRequest<RegiaoDestaque[]>({
    path: '/admin/regioes-destaque',
    query: { apenasAtivas },
  })
}

export async function createRegiaoDestaque(body: RegiaoDestaqueInput) {
  return httpRequest<RegiaoDestaque>({
    method: 'POST',
    path: '/admin/regioes-destaque',
    body,
  })
}

export async function updateRegiaoDestaque(id: number, body: RegiaoDestaqueInput) {
  return httpRequest<RegiaoDestaque>({
    method: 'PUT',
    path: `/admin/regioes-destaque/${id}`,
    body,
  })
}

export async function deleteRegiaoDestaque(id: number) {
  return httpRequest<null>({
    method: 'DELETE',
    path: `/admin/regioes-destaque/${id}`,
  })
}
