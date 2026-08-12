import { httpRequest } from '@/core/api/httpClient'
import type {
  LicencaAlertaOutput,
  LicencaInput,
  LicencaOutput,
  LicencaPlano,
  LicencaPlanoConfig,
  LicencaPlanoConfigInput,
  LicencaRenovacaoInput,
  LicencaStatus,
  LicencaStatusOutput,
  LicencaUpdateInput,
} from '@/features/licenses/types'

export function fetchLicencaStatus() {
  return httpRequest<LicencaStatusOutput>({ path: '/licenca/status' })
}

export function fetchLicencaAlertasAdmin() {
  return httpRequest<LicencaAlertaOutput[]>({ path: '/licenca/admin/alertas' })
}

export function marcarAlertaLido(alertaId: number) {
  return httpRequest<void>({ method: 'PATCH', path: `/licenca/alertas/${alertaId}/lido` })
}

export function createLicenca(empresaId: number, body: LicencaInput) {
  return httpRequest<LicencaOutput>({
    method: 'POST',
    path: `/conta/empresas/${empresaId}/licencas`,
    body,
  })
}

export function listLicencas(empresaId: number) {
  return httpRequest<LicencaOutput[]>({ path: `/conta/empresas/${empresaId}/licencas` })
}

export function listLicencasAdmin(params?: {
  status?: LicencaStatus
  plano?: LicencaPlano
  empresaId?: number
}) {
  return httpRequest<LicencaOutput[]>({
    path: '/licenca/admin',
    query: {
      status: params?.status,
      plano: params?.plano,
      empresaId: params?.empresaId,
    },
  })
}

export function updateLicenca(licencaId: number, body: LicencaUpdateInput) {
  return httpRequest<LicencaOutput>({
    method: 'PUT',
    path: `/licenca/admin/${licencaId}`,
    body,
  })
}

export function cancelarLicenca(licencaId: number) {
  return httpRequest<LicencaOutput>({
    method: 'POST',
    path: `/licenca/admin/${licencaId}/cancelar`,
  })
}

export function renovarLicenca(licencaId: number, body: LicencaRenovacaoInput) {
  return httpRequest<LicencaOutput>({
    method: 'POST',
    path: `/licenca/admin/${licencaId}/renovar`,
    body,
  })
}

export function deleteLicenca(licencaId: number) {
  return httpRequest<void>({
    method: 'DELETE',
    path: `/licenca/admin/${licencaId}`,
  })
}

export function listPlanosConfig() {
  return httpRequest<LicencaPlanoConfig[]>({ path: '/licenca/admin/planos' })
}

export function updatePlanoConfig(plano: LicencaPlano, body: LicencaPlanoConfigInput) {
  return httpRequest<LicencaPlanoConfig>({
    method: 'PUT',
    path: `/licenca/admin/planos/${plano}`,
    body,
  })
}

export function reativarEventosEmpresa(empresaId: number) {
  return httpRequest<{ reativados: number }>({
    method: 'POST',
    path: `/conta/empresas/${empresaId}/eventos/reativar`,
  })
}
