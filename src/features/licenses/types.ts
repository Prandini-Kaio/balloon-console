export type LicencaPlano = 'TRIAL' | 'MENSAL' | 'ANUAL'
export type LicencaStatus = 'ATIVA' | 'VENCIDA' | 'CANCELADA' | 'PENDENTE'
export type LicencaAlertaTipo = 'AVISO_7_DIAS' | 'AVISO_1_DIA' | 'VENCIDA'

export const LICENCA_PERMISSOES = [
  'EVENTOS_CRIAR',
  'EVENTOS_EDITAR',
  'EVENTOS_EXCLUIR',
  'EVENTOS_METRICAS',
  'USUARIOS_GERIR',
] as const

export type LicencaPermissao = (typeof LICENCA_PERMISSOES)[number]

export type PoliticaEfetiva = {
  plano: LicencaPlano
  maxEventos: number | null
  maxUsuarios: number | null
  permissoes: LicencaPermissao[]
  usandoOverridePermissoes: boolean
  usandoOverrideMaxEventos: boolean
  usandoOverrideMaxUsuarios: boolean
}

export type LicencaAlertaOutput = {
  id: number
  licencaId: number
  empresaId: number
  empresaNome: string
  tipo: LicencaAlertaTipo
  emitidoEm: string
  lido: boolean
}

export type LicencaStatusOutput = {
  plano?: LicencaPlano
  status: LicencaStatus
  diasRestantes?: number
  alertasNaoLidos: LicencaAlertaOutput[]
  politica?: PoliticaEfetiva | null
  renewUrl?: string
  licencaAtiva?: boolean
}

export type LicencaInput = {
  plano: LicencaPlano
  dataInicio: string
  dataFim: string
  valorCentavos?: number
  maxEventosOverride?: number | null
  maxUsuariosOverride?: number | null
  permissoesOverride?: LicencaPermissao[] | null
}

export type LicencaUpdateInput = {
  plano?: LicencaPlano
  dataInicio?: string
  dataFim?: string
  valorCentavos?: number
  maxEventosOverride?: number | null
  maxUsuariosOverride?: number | null
  permissoesOverride?: LicencaPermissao[] | null
  limparOverrides?: boolean
}

export type LicencaRenovacaoInput = {
  plano: LicencaPlano
  dataInicio: string
  dataFim: string
  valorCentavos?: number
}

export type LicencaOutput = {
  id: number
  empresaId: number
  empresaNome: string
  plano: LicencaPlano
  status: LicencaStatus
  dataInicio: string
  dataFim: string
  valorCentavos?: number
  origem: string
  diasRestantes?: number
  maxEventosOverride?: number | null
  maxUsuariosOverride?: number | null
  permissoesOverride?: LicencaPermissao[] | null
  politicaEfetiva?: PoliticaEfetiva
}

export type LicencaPlanoConfig = {
  plano: LicencaPlano
  maxEventos: number | null
  maxUsuarios: number | null
  permissoes: LicencaPermissao[]
  valorCentavos: number
  periodoDias: number
}

export type LicencaPlanoConfigInput = {
  maxEventos: number | null
  maxUsuarios: number | null
  permissoes: LicencaPermissao[]
  valorCentavos: number
  periodoDias: number
}

export const PERMISSAO_LABELS: Record<LicencaPermissao, string> = {
  EVENTOS_CRIAR: 'Criar eventos',
  EVENTOS_EDITAR: 'Editar eventos',
  EVENTOS_EXCLUIR: 'Excluir eventos',
  EVENTOS_METRICAS: 'Ver métricas',
  USUARIOS_GERIR: 'Gerir usuários',
}
