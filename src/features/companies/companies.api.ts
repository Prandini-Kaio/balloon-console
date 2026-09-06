import { httpRequest } from '@/core/api/httpClient'
import { isApiFailure } from '@/core/api/types'
import type {
  Company,
  CompanyCreateInput,
  CompanyUpdateInput,
  UsuarioContaInput,
  UsuarioContaOutput,
} from '@/features/companies/types'
import type { LicencaOutput } from '@/features/licenses/types'

export async function listCompanies(): Promise<Company[]> {
  const res = await httpRequest<Company[]>({ path: '/empresa' })
  if (isApiFailure(res)) throw new Error(res.message)
  return res.data
}

export async function getCompany(id: number): Promise<Company> {
  const res = await httpRequest<Company>({ path: `/empresa/${id}` })
  if (isApiFailure(res)) throw new Error(res.message)
  return res.data
}

export async function createCompany(input: CompanyCreateInput): Promise<Company> {
  const res = await httpRequest<Company>({ method: 'POST', path: '/empresa', body: input })
  if (isApiFailure(res)) throw new Error(res.message)
  return res.data
}

export async function updateCompany(id: number, input: CompanyUpdateInput): Promise<Company> {
  const res = await httpRequest<Company>({ method: 'PUT', path: `/empresa/${id}`, body: input })
  if (isApiFailure(res)) throw new Error(res.message)
  return res.data
}

export async function deleteCompany(id: number): Promise<void> {
  const res = await httpRequest<void>({ method: 'DELETE', path: `/empresa/${id}` })
  if (isApiFailure(res)) throw new Error(res.message)
}

export async function listCompanyUsers(empresaId: number): Promise<UsuarioContaOutput[]> {
  const res = await httpRequest<UsuarioContaOutput[]>({ path: `/empresa/${empresaId}/usuarios` })
  if (isApiFailure(res)) throw new Error(res.message)
  return res.data
}

export async function createCompanyUser(empresaId: number, input: UsuarioContaInput): Promise<UsuarioContaOutput> {
  const res = await httpRequest<UsuarioContaOutput>({
    method: 'POST',
    path: `/empresa/${empresaId}/usuarios`,
    body: input,
  })
  if (isApiFailure(res)) throw new Error(res.message)
  return res.data
}

export async function listCompanyLicencas(empresaId: number): Promise<LicencaOutput[]> {
  const res = await httpRequest<LicencaOutput[]>({ path: `/empresa/${empresaId}/licencas` })
  if (isApiFailure(res)) throw new Error(res.message)
  return res.data
}
