import { z } from 'zod'
import { STATUS_EVENTO_VALUES, TIPO_EVENTO_VALUES } from '@/features/events/types'

export const eventFormSchema = z.object({
  nome: z.string().min(1, 'Obrigatório'),
  descricao: z.string().min(1, 'Obrigatório'),
  categoriaId: z.coerce.number().int().positive('Informe um ID de categoria válido'),
  status: z.enum(STATUS_EVENTO_VALUES).optional(),
  tipoEvento: z.enum(TIPO_EVENTO_VALUES),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  dataInicio: z.string().min(1, 'Obrigatório'),
  dataFim: z.string().min(1, 'Obrigatório'),
  ativo: z.boolean(),
  companyId: z.string(),
  imagemCapaUrl: z.string().optional().default(''),
})
