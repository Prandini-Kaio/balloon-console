import { httpRequest } from '@/core/api/httpClient'

export type CategoriaOutput = { nome: string }

export async function fetchCategoriaById(id: number) {
  return httpRequest<CategoriaOutput>({
    path: '/evento/categoria',
    query: { id },
  })
}
