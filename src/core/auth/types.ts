export type UserRole = 'admin' | 'company'

export type AuthUser = {
  id: string
  email: string
  name: string
  picture: string | null
  emailVerified: boolean
  role: UserRole
}

export type AuthState = {
  token: string | null
  user: AuthUser | null
  ready: boolean
}
