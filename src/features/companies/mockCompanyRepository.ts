import type { CompanyRepository } from '@/features/companies/companies.repository'
import type { Company, CompanyInput } from '@/features/companies/types'

const STORAGE_KEY = 'balloon_web_companies'

function readRaw(): Company[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((row) => {
        if (!row || typeof row !== 'object') return null
        const o = row as Record<string, unknown>
        const id = typeof o.id === 'string' ? o.id : ''
        const name = typeof o.name === 'string' ? o.name : ''
        if (!id || !name) return null
        return { id, name }
      })
      .filter((x): x is Company => x !== null)
  } catch {
    return []
  }
}

function writeRaw(items: Company[]) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function seedIfEmpty(): Company[] {
  let items = readRaw()
  if (items.length === 0) {
    items = [{ id: crypto.randomUUID(), name: 'Empresa demonstração' }]
    writeRaw(items)
  }
  return items
}

export class MockCompanyRepository implements CompanyRepository {
  async list(): Promise<Company[]> {
    return seedIfEmpty()
  }

  async getById(id: string): Promise<Company | null> {
    return seedIfEmpty().find((c) => c.id === id) ?? null
  }

  async create(input: CompanyInput): Promise<Company> {
    const items = seedIfEmpty()
    const company: Company = { id: crypto.randomUUID(), name: input.name.trim() }
    items.push(company)
    writeRaw(items)
    return company
  }

  async update(id: string, input: CompanyInput): Promise<Company | null> {
    const items = seedIfEmpty()
    const idx = items.findIndex((c) => c.id === id)
    if (idx < 0) return null
    items[idx] = { ...items[idx], name: input.name.trim() }
    writeRaw(items)
    return items[idx]
  }

  async remove(id: string): Promise<void> {
    const items = seedIfEmpty().filter((c) => c.id !== id)
    writeRaw(items)
  }
}
