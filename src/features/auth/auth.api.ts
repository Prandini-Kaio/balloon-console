import { httpRequest } from '@/core/api/httpClient'

export type LoginRequest = { email: string; password: string }

export type LoginResponse = {
  success: boolean
  message: string
  token?: string
  user?: {
    id: string
    email: string
    name: string
    picture: string | null
    emailVerified: boolean
  }
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
  return httpRequest<{
    id: string
    email: string
    name: string
    picture: string | null
    emailVerified: boolean
  }>({ path: '/auth/me', skipUnauthorizedRedirect: true })
}
