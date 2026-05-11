import type {
  EventFormValues,
  EventoInputBody,
  EventoOutput,
} from '@/features/events/types'

export function resolveCategoriaIdFromName(
  nome: string,
  options: { id: number; nome: string }[],
): number {
  const found = options.find((o) => o.nome === nome)
  return found?.id ?? 0
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromDatetimeLocal(value: string): string {
  if (!value) return value
  if (value.length === 16) return `${value}:00`
  return value
}

export function eventoOutputToFormValues(e: EventoOutput, companyId = '', categoriaId = 0): EventFormValues {
  return {
    nome: e.nome,
    descricao: e.descricao,
    categoriaId,
    status: e.status,
    tipoEvento: e.tipoEvento,
    latitude: e.localizacao.latitude,
    longitude: e.localizacao.longitude,
    dataInicio: toDatetimeLocal(e.dataInicio),
    dataFim: toDatetimeLocal(e.dataFim),
    ativo: e.isAtivo,
    companyId,
  }
}

export function formValuesToEventoInput(v: EventFormValues): EventoInputBody {
  return {
    nome: v.nome.trim(),
    descricao: v.descricao.trim(),
    categoriaId: v.categoriaId,
    status: v.status,
    tipoEvento: v.tipoEvento,
    latitude: v.latitude,
    longitude: v.longitude,
    dataInicio: fromDatetimeLocal(v.dataInicio),
    dataFim: fromDatetimeLocal(v.dataFim),
    ativo: v.ativo,
  }
}
