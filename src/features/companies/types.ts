import type { LicencaInput, LicencaPlano, LicencaStatus } from '@/features/licenses/types'

export type EmpresaStatus = 'ATIVA' | 'INATIVA' | 'SUSPENSA'

export type Company = {
  id: number
  nome: string
  emailContato?: string | null
  status: EmpresaStatus
  licencaPlano?: LicencaPlano | null
  licencaStatus?: LicencaStatus | null
  licencaDataFim?: string | null
  diasRestantesLicenca?: number | null
  totalUsuarios: number
}

export type CompanyCreateInput = {
  nome: string
  emailContato?: string
  usuarioNome: string
  usuarioEmail: string
  usuarioSenha: string
  licencaInicial?: LicencaInput
}

export type CompanyUpdateInput = {
  nome: string
  emailContato?: string
  status?: EmpresaStatus
}

export type UsuarioContaOutput = {
  id: number
  nome: string
  email: string
  ativo: boolean
  empresaId?: number
}

export type UsuarioContaInput = {
  nome: string
  email: string
  senha: string
}
