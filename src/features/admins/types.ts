import type { AdminPermissao } from '@/core/auth/types'

export type AdminConta = {
  id: number
  nome: string
  email: string
  ativo: boolean
  role: 'SUPER_ADMIN' | 'EMPRESA'
  permissoes: AdminPermissao[]
}

export type AdminContaInput = {
  nome: string
  email: string
  senha: string
  permissoes: AdminPermissao[]
}

export type AdminContaUpdateInput = {
  nome?: string
  ativo?: boolean
  novaSenha?: string
  permissoes?: AdminPermissao[]
}
