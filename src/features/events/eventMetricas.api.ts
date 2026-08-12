import { httpRequest } from '@/core/api/httpClient'
import type { EventoMetricasOutput } from '@/features/dashboard/types'

export function fetchEventoMetricas(id: number) {
  return httpRequest<EventoMetricasOutput>({ path: `/evento/${id}/metricas` })
}
