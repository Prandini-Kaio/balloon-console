import type { CompanyRepository } from '@/features/companies/companies.repository'
import type { Company, CompanyInput } from '@/features/companies/types'

export class HttpCompanyRepository implements CompanyRepository {
  async list(): Promise<Company[]> {
    throw new Error('API de empresas ainda não está disponível no backend.')
  }

  async getById(): Promise<Company | null> {
    throw new Error('API de empresas ainda não está disponível no backend.')
  }

  async create(input: CompanyInput): Promise<Company> {
    void input
    throw new Error('API de empresas ainda não está disponível no backend.')
  }

  async update(): Promise<Company | null> {
    throw new Error('API de empresas ainda não está disponível no backend.')
  }

  async remove(): Promise<void> {
    throw new Error('API de empresas ainda não está disponível no backend.')
  }
}
