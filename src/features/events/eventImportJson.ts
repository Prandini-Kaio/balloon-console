import { z } from 'zod'
import { STATUS_EVENTO_VALUES, TIPO_EVENTO_VALUES } from '@/features/events/types'
import type { EventFormValues } from '@/features/events/types'
import { formatIsoOrDatetimeToFormLocal } from '@/features/events/eventMappers'

export const EVENT_IMPORT_JSON_EXAMPLE = `{
  "nome": "Festa de lançamento",
  "descricao": "Descrição do evento para o app.",
  "categoriaId": 1,
  "status": "ATIVO",
  "tipoEvento": "SOCIAL",
  "latitude": -23.55052,
  "longitude": -46.633308,
  "dataInicio": "2026-12-01T20:00:00",
  "dataFim": "2026-12-02T04:00:00",
  "ativo": true,
  "companyId": "",
  "imagemCapaUrl": "https://exemplo.com/capa.jpg"
}`

const eventImportPartialSchema = z
  .object({
    nome: z.string().optional(),
    descricao: z.string().optional(),
    categoriaId: z.coerce.number().int().positive().optional(),
    status: z.enum(STATUS_EVENTO_VALUES).optional(),
    tipoEvento: z.enum(TIPO_EVENTO_VALUES).optional(),
    latitude: z.coerce.number().optional(),
    longitude: z.coerce.number().optional(),
    dataInicio: z.string().optional(),
    dataFim: z.string().optional(),
    ativo: z.boolean().optional(),
    companyId: z.string().optional(),
    imagemCapaUrl: z.string().optional(),
  })

export function parseEventImportJson(
  raw: string,
): { ok: true; value: Partial<EventFormValues> } | { ok: false; error: string } {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw) as unknown
  } catch {
    return { ok: false, error: 'JSON inválido' }
  }
  const r = eventImportPartialSchema.safeParse(parsed)
  if (!r.success) {
    const msg = r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
    return { ok: false, error: msg || 'Conteúdo inválido' }
  }
  const v = r.data
  const out: Partial<EventFormValues> = {}
  if (v.nome !== undefined) out.nome = v.nome
  if (v.descricao !== undefined) out.descricao = v.descricao
  if (v.categoriaId !== undefined) out.categoriaId = v.categoriaId
  if (v.status !== undefined) out.status = v.status
  if (v.tipoEvento !== undefined) out.tipoEvento = v.tipoEvento
  if (v.latitude !== undefined) out.latitude = v.latitude
  if (v.longitude !== undefined) out.longitude = v.longitude
  if (v.dataInicio !== undefined) out.dataInicio = formatIsoOrDatetimeToFormLocal(v.dataInicio)
  if (v.dataFim !== undefined) out.dataFim = formatIsoOrDatetimeToFormLocal(v.dataFim)
  if (v.ativo !== undefined) out.ativo = v.ativo
  if (v.companyId !== undefined) out.companyId = v.companyId
  if (v.imagemCapaUrl !== undefined) out.imagemCapaUrl = v.imagemCapaUrl
  return { ok: true, value: out }
}
