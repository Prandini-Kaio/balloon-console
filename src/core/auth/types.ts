export type UserRole = 'super_admin' | 'empresa'

export const ADMIN_PERMISSOES = [
  'DASHBOARD_ADMIN',
  'EVENTOS_GLOBAL',
  'CATEGORIAS_GERIR',
  'DESTAQUES_GERIR',
  'EMPRESAS_GERIR',
  'LICENCAS_GERIR',
  'ADMINS_GERIR',
] as const

export type AdminPermissao = (typeof ADMIN_PERMISSOES)[number]

export const ADMIN_PERMISSAO_LABELS: Record<AdminPermissao, string> = {
  DASHBOARD_ADMIN: 'Dashboard administrativo',
  EVENTOS_GLOBAL: 'Eventos (visão global)',
  CATEGORIAS_GERIR: 'Categorias',
  DESTAQUES_GERIR: 'Destaques e regiões',
  EMPRESAS_GERIR: 'Empresas e usuários',
  LICENCAS_GERIR: 'Licenças e planos',
  ADMINS_GERIR: 'Administradores',
}

export type AuthUser = {
  id: string
  email: string
  name: string
  picture: string | null
  emailVerified: boolean
  role: UserRole
  empresaId?: number
  permissoes?: AdminPermissao[]
}

export type AuthState = {
  token: string | null
  user: AuthUser | null
  ready: boolean
}
