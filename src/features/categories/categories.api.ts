import { httpRequest } from '@/core/api/httpClient'

export type CategoriaOutput = {
  id: number
  nome: string
}

export async function listCategorias() {
  return httpRequest<CategoriaOutput[]>({ path: '/evento/categoria' })
}

export async function fetchCategoriaById(id: number) {
  return httpRequest<CategoriaOutput>({
    path: '/evento/categoria',
    query: { id },
  })
}

export async function createCategoria(input: { nome: string }) {
  return httpRequest<null>({
    method: 'POST',
    path: '/evento/categoria',
    body: input,
  })
}
