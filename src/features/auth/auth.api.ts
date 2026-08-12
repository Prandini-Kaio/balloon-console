import { httpRequest } from '@/core/api/httpClient'

export type LoginRequest = { email: string; password: string }

export type AuthUserResponse = {
  id: string
  email: string
  name: string
  picture: string | null
  emailVerified: boolean
  role?: string
  empresaId?: number
}

export type LoginResponse = {
  success: boolean
  message: string
  token?: string
  user?: AuthUserResponse
}

export async function loginWithEmail(body: LoginRequest) {
  return httpRequest<LoginResponse>({
    method: 'POST',
    path: '/auth/login',
    body,
    skipAuth: true,
  })
}

export async function fetchCurrentUser() {
  return httpRequest<AuthUserResponse>({ path: '/auth/me', skipUnauthorizedRedirect: true })
}
