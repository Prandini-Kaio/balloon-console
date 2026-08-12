export type UserRole = 'super_admin' | 'empresa'

export type AuthUser = {
  id: string
  email: string
  name: string
  picture: string | null
  emailVerified: boolean
  role: UserRole
  empresaId?: number
}

export type AuthState = {
  token: string | null
  user: AuthUser | null
  ready: boolean
}
