import { Navigate, Outlet } from 'react-router-dom'
import type { UserRole } from '@/core/auth/types'
import { useAuth } from '@/core/auth/AuthContext'

type RoleRouteProps = {
  roles: UserRole[]
  redirectTo?: string
}

export function RoleRoute({ roles, redirectTo = '/admin/dashboard' }: RoleRouteProps) {
  const { user } = useAuth()

  if (!user || !roles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}
