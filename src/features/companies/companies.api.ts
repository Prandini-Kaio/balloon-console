import { getCompanyRepository } from '@/features/companies/companies.factory'
import type { CompanyInput } from '@/features/companies/types'

export function listCompanies() {
  return getCompanyRepository().list()
}

export function getCompany(id: string) {
  return getCompanyRepository().getById(id)
}

export function createCompany(input: CompanyInput) {
  return getCompanyRepository().create(input)
}

export function updateCompany(id: string, input: CompanyInput) {
  return getCompanyRepository().update(id, input)
}

export function deleteCompany(id: string) {
  return getCompanyRepository().remove(id)
}
