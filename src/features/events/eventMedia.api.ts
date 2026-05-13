import { httpRequest } from '@/core/api/httpClient'
import type { ApiResult } from '@/core/api/types'

export type EventoCapaPresignResponse = {
  uploadUrl: string
  publicUrl: string
  key: string
  contentType: string
}

export async function presignEventoCapa(
  contentType: string,
  filename?: string,
): Promise<ApiResult<EventoCapaPresignResponse>> {
  return httpRequest<EventoCapaPresignResponse>({
    method: 'POST',
    path: '/evento/midia/presign',
    body: { contentType, filename: filename ?? '' },
  })
}

export async function putCapaToR2(uploadUrl: string, file: File, contentType: string): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': contentType },
  })
  if (!res.ok) {
    throw new Error(`Falha ao enviar imagem (${res.status})`)
  }
}
