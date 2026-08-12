import type { AuthUser } from '@/core/auth/types'

function mapRole(role?: string | null): AuthUser['role'] {
  if (role === 'ROLE_SUPER_ADMIN') return 'super_admin'
  if (role === 'ROLE_EMPRESA') return 'empresa'
  return 'super_admin'
}

export function mapUser(u: {
  id: string
  email: string
  name: string
  picture: string | null
  emailVerified: boolean
  role?: string | null
  empresaId?: number | null
}): AuthUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    picture: u.picture ?? null,
    emailVerified: u.emailVerified,
    role: mapRole(u.role),
    empresaId: u.empresaId ?? undefined,
  }
}

export function isSuperAdmin(user: AuthUser | null): boolean {
  return user?.role === 'super_admin'
}

export function isEmpresa(user: AuthUser | null): boolean {
  return user?.role === 'empresa'
}
