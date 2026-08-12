import { useQuery } from '@tanstack/react-query'
import { fetchLicencaStatus } from '@/features/licenses/licenses.api'
import { isApiFailure } from '@/core/api/types'
import { useAuth } from '@/core/auth/AuthContext'
import { isEmpresa } from '@/core/auth/mapUser'
import type { LicencaPermissao, LicencaStatusOutput } from '@/features/licenses/types'

export function useLicencaStatusQuery(enabled = true) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['licenca-status'],
    enabled: enabled && isEmpresa(user),
    queryFn: async () => {
      const res = await fetchLicencaStatus()
      if (isApiFailure(res)) throw new Error(res.message)
      return res.data
    },
  })
}

export function hasPermissao(status: LicencaStatusOutput | undefined, code: LicencaPermissao): boolean {
  if (!status?.licencaAtiva) return false
  return status.politica?.permissoes?.includes(code) ?? false
}
