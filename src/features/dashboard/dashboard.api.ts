import { httpRequest } from '@/core/api/httpClient'
import type { DashboardAdminOutput, DashboardEmpresaOutput } from '@/features/dashboard/types'

export function fetchDashboardEmpresa() {
  return httpRequest<DashboardEmpresaOutput>({ path: '/dashboard/empresa' })
}

export function fetchDashboardAdmin() {
  return httpRequest<DashboardAdminOutput>({ path: '/dashboard/admin' })
}
