import { Navigate, Outlet } from 'react-router-dom'
import type { AdminPermissao } from '@/core/auth/types'
import { useAuth } from '@/core/auth/AuthContext'
import { hasAdminPermissao } from '@/core/auth/mapUser'

type PermissionRouteProps = {
  permission: AdminPermissao
  redirectTo?: string
}

export function PermissionRoute({ permission, redirectTo = '/admin/dashboard' }: PermissionRouteProps) {
  const { user } = useAuth()

  if (!hasAdminPermissao(user, permission)) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}
