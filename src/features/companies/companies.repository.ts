import type { Company, CompanyInput } from '@/features/companies/types'

export interface CompanyRepository {
  list(): Promise<Company[]>
  getById(id: string): Promise<Company | null>
  create(input: CompanyInput): Promise<Company>
  update(id: string, input: CompanyInput): Promise<Company | null>
  remove(id: string): Promise<void>
}
