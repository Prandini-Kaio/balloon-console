import type { EventoOutput } from '@/features/events/types'
import type { LicencaAlertaOutput, LicencaStatusOutput } from '@/features/licenses/types'

export type DashboardEmpresaOutput = {
  totalEventos: number
  eventosPorStatus: Record<string, number>
  eventosAtivos: number
  eventosFinalizados: number
  proximosEventos: EventoOutput[]
  licencaResumo: LicencaStatusOutput
  alertasNaoLidos: number
  totalFavoritos: number | null
  visualizacoesEstimadas: number | null
  usuariosEngajados: number | null
  totalCheckins: number | null
  cliquesWhatsapp: number | null
}

export type DashboardAdminOutput = {
  empresasAtivas: number
  totalEmpresas: number
  totalEventos: number
  eventosAtivos: number
  licencasVencendo: number
  alertasRecentes: LicencaAlertaOutput[]
}

export type EventoMetricasOutput = {
  visualizacoes: number
  checkins: number
  favoritos: number
  cliquesWhatsapp: number
}
