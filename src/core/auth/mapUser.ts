import type { AuthUser } from '@/core/auth/types'

export function mapUser(u: {
  id: string
  email: string
  name: string
  picture: string | null
  emailVerified: boolean
}): AuthUser {
  const role: AuthUser['role'] = u.email === 'administrador@balloon.com' ? 'admin' : 'company'
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    picture: u.picture ?? null,
    emailVerified: u.emailVerified,
    role,
  }
}
