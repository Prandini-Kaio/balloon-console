import { httpRequest } from '@/core/api/httpClient'
import { isApiFailure } from '@/core/api/types'
import type { AdminConta, AdminContaInput, AdminContaUpdateInput } from '@/features/admins/types'

export async function listAdmins(): Promise<AdminConta[]> {
  const res = await httpRequest<AdminConta[]>({ path: '/conta/admins' })
  if (isApiFailure(res)) throw new Error(res.message)
  return res.data
}

export async function createAdmin(body: AdminContaInput): Promise<AdminConta> {
  const res = await httpRequest<AdminConta>({ method: 'POST', path: '/conta/admins', body })
  if (isApiFailure(res)) throw new Error(res.message)
  return res.data
}

export async function updateAdmin(id: number, body: AdminContaUpdateInput): Promise<AdminConta> {
  const res = await httpRequest<AdminConta>({ method: 'PUT', path: `/conta/admins/${id}`, body })
  if (isApiFailure(res)) throw new Error(res.message)
  return res.data
}
