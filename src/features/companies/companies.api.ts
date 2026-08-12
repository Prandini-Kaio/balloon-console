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
  const res = await httpRequest<Company[]>({ path: '/conta/empresas' })
  if (isApiFailure(res)) throw new Error(res.message)
  return res.data
}

export async function getCompany(id: number): Promise<Company> {
  const res = await httpRequest<Company>({ path: `/conta/empresas/${id}` })
  if (isApiFailure(res)) throw new Error(res.message)
  return res.data
}

export async function createCompany(input: CompanyCreateInput): Promise<Company> {
  const res = await httpRequest<Company>({ method: 'POST', path: '/conta/empresas', body: input })
  if (isApiFailure(res)) throw new Error(res.message)
  return res.data
}

export async function updateCompany(id: number, input: CompanyUpdateInput): Promise<Company> {
  const res = await httpRequest<Company>({ method: 'PUT', path: `/conta/empresas/${id}`, body: input })
  if (isApiFailure(res)) throw new Error(res.message)
  return res.data
}

export async function deleteCompany(id: number): Promise<void> {
  const res = await httpRequest<void>({ method: 'DELETE', path: `/conta/empresas/${id}` })
  if (isApiFailure(res)) throw new Error(res.message)
}

export async function listCompanyUsers(empresaId: number): Promise<UsuarioContaOutput[]> {
  const res = await httpRequest<UsuarioContaOutput[]>({ path: `/conta/empresas/${empresaId}/usuarios` })
  if (isApiFailure(res)) throw new Error(res.message)
  return res.data
}

export async function createCompanyUser(empresaId: number, input: UsuarioContaInput): Promise<UsuarioContaOutput> {
  const res = await httpRequest<UsuarioContaOutput>({
    method: 'POST',
    path: `/conta/empresas/${empresaId}/usuarios`,
    body: input,
  })
  if (isApiFailure(res)) throw new Error(res.message)
  return res.data
}

export async function listCompanyLicencas(empresaId: number): Promise<LicencaOutput[]> {
  const res = await httpRequest<LicencaOutput[]>({ path: `/conta/empresas/${empresaId}/licencas` })
  if (isApiFailure(res)) throw new Error(res.message)
  return res.data
}
