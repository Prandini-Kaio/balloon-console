import type { AdminPermissao, AuthUser } from '@/core/auth/types'
import { ADMIN_PERMISSOES } from '@/core/auth/types'

function mapRole(role?: string | null): AuthUser['role'] {
  if (role === 'ROLE_SUPER_ADMIN') return 'super_admin'
  if (role === 'ROLE_EMPRESA') return 'empresa'
  return 'super_admin'
}

function mapPermissoes(raw?: string[] | null): AdminPermissao[] | undefined {
  if (!raw?.length) return undefined
  const allowed = new Set<string>(ADMIN_PERMISSOES)
  return raw.filter((p): p is AdminPermissao => allowed.has(p))
}

export function mapUser(u: {
  id: string
  email: string
  name: string
  picture: string | null
  emailVerified: boolean
  role?: string | null
  empresaId?: number | null
  permissoes?: string[] | null
}): AuthUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    picture: u.picture ?? null,
    emailVerified: u.emailVerified,
    role: mapRole(u.role),
    empresaId: u.empresaId ?? undefined,
    permissoes: mapPermissoes(u.permissoes),
  }
}

export function isSuperAdmin(user: AuthUser | null): boolean {
  return user?.role === 'super_admin'
}

export function isEmpresa(user: AuthUser | null): boolean {
  return user?.role === 'empresa'
}

export function hasAdminPermissao(user: AuthUser | null, permissao: AdminPermissao): boolean {
  if (!isSuperAdmin(user)) return false
  return Boolean(user?.permissoes?.includes(permissao))
}
