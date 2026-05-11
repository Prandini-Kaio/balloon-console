export const TIPO_EVENTO_VALUES = [
  'CULTURAL',
  'BUSINESS',
  'CONCERTO',
  'ESPORTIVO',
  'FESTIVAL',
  'SOCIAL',
  'GASTRONOMICO',
  'EDUCACIONAL',
  'OUTROS',
] as const

export type TipoEvento = (typeof TIPO_EVENTO_VALUES)[number]

export const STATUS_EVENTO_VALUES = ['ATIVO', 'INATIVO', 'CANCELADO', 'FINALIZADO'] as const

export type StatusEvento = (typeof STATUS_EVENTO_VALUES)[number]

export type EventoOutput = {
  id: number
  nome: string
  descricao: string
  categoria: string
  status: StatusEvento
  tipoEvento: TipoEvento
  localizacao: { latitude: number; longitude: number }
  dataInicio: string
  dataFim: string
  dataCriacao: string
  dataAtualizacao: string
  isPatrocinado: boolean
  isAtivo: boolean
}

export type EventoInputBody = {
  nome: string
  descricao: string
  categoriaId: number
  status?: StatusEvento
  tipoEvento: TipoEvento
  latitude: number
  longitude: number
  dataInicio: string
  dataFim: string
  ativo: boolean
}

export type EventFormValues = {
  nome: string
  descricao: string
  categoriaId: number
  status?: StatusEvento
  tipoEvento: TipoEvento
  latitude: number
  longitude: number
  dataInicio: string
  dataFim: string
  ativo: boolean
  companyId: string
}

export type EventoListFilter = {
  nome?: string
  categoria?: string
  status?: StatusEvento
  tipoEvento?: TipoEvento
  dataInicio?: string
  dataFim?: string
}

export type SpringPage<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}
