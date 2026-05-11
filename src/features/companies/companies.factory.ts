import { companiesUseHttp } from '@/core/config/env'
import type { CompanyRepository } from '@/features/companies/companies.repository'
import { HttpCompanyRepository } from '@/features/companies/httpCompanyRepository'
import { MockCompanyRepository } from '@/features/companies/mockCompanyRepository'

let repository: CompanyRepository | null = null

export function getCompanyRepository(): CompanyRepository {
  if (!repository) {
    repository = companiesUseHttp() ? new HttpCompanyRepository() : new MockCompanyRepository()
  }
  return repository
}
