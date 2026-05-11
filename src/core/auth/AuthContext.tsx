import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
/* eslint-disable react-refresh/only-export-components -- hook compartilhado com o provider */
import { useNavigate } from 'react-router-dom'
import type { AuthState, AuthUser } from '@/core/auth/types'
import { clearStoredToken, getStoredToken, setStoredToken } from '@/core/auth/tokenStorage'
import { onAuthLogout } from '@/core/api/authEvents'
import { fetchCurrentUser } from '@/features/auth/auth.api'
import { mapUser } from '@/core/auth/mapUser'

type AuthContextValue = AuthState & {
  login: (token: string, user: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const existing = getStoredToken()
    if (!existing) {
      queueMicrotask(() => setReady(true))
      return
    }
    queueMicrotask(() => setToken(existing))
    void (async () => {
      const res = await fetchCurrentUser()
      if (res.ok && res.data) {
        setUser(mapUser(res.data))
      } else {
        clearStoredToken()
        setToken(null)
        setUser(null)
      }
      setReady(true)
    })()
  }, [])

  useEffect(() => {
    return onAuthLogout(() => {
      clearStoredToken()
      setToken(null)
      setUser(null)
      navigate('/login', { replace: true })
    })
  }, [navigate])

  const login = useCallback((newToken: string, rawUser: AuthUser) => {
    setStoredToken(newToken)
    setToken(newToken)
    setUser(rawUser)
  }, [])

  const logout = useCallback(() => {
    clearStoredToken()
    setToken(null)
    setUser(null)
    navigate('/login', { replace: true })
  }, [navigate])

  const value = useMemo(
    () => ({
      token,
      user,
      ready,
      login,
      logout,
    }),
    [token, user, ready, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth fora de AuthProvider')
  return ctx
}
