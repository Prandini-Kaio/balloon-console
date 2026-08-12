import { useQuery } from '@tanstack/react-query'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { Alert, Box, Button, CircularProgress, Grid, Stack, Typography } from '@mui/material'
import { PageHeader } from '@/shared/ui/PageHeader'
import { StatCard } from '@/shared/ui/StatCard'
import { isApiFailure } from '@/core/api/types'
import { fetchEventoById } from '@/features/events/events.api'
import { fetchEventoMetricas } from '@/features/events/eventMetricas.api'
import { formatDateTimePt } from '@/shared/lib/dateFormat'

export function EventMetricsPage() {
  const { id } = useParams<{ id: string }>()
  const eventoId = Number(id)

  const eventoQuery = useQuery({
    queryKey: ['evento', eventoId],
    enabled: Number.isFinite(eventoId),
    queryFn: async () => {
      const res = await fetchEventoById(eventoId)
      if (isApiFailure(res)) throw new Error(res.message)
      return res.data
    },
  })

  const metricasQuery = useQuery({
    queryKey: ['evento-metricas', eventoId],
    enabled: Number.isFinite(eventoId),
    queryFn: async () => {
      const res = await fetchEventoMetricas(eventoId)
      if (isApiFailure(res)) throw new Error(res.message)
      return res.data
    },
  })

  if (!Number.isFinite(eventoId)) {
    return <Alert severity="error">Identificador inválido</Alert>
  }

  const loading = eventoQuery.isLoading || metricasQuery.isLoading
  const error = eventoQuery.error || metricasQuery.error

  return (
    <Box>
      <PageHeader
        title={eventoQuery.data?.nome ?? 'Métricas do evento'}
        subtitle="Engajamento no app Balloon"
        actions={
          <Stack direction="row" spacing={1}>
            <Button component={RouterLink} to="/admin/eventos" variant="outlined">
              Voltar
            </Button>
            <Button component={RouterLink} to={`/admin/eventos/${eventoId}/editar`} variant="contained">
              Editar
            </Button>
          </Stack>
        }
      />
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{(error as Error).message}</Alert>
      ) : (
        <Stack spacing={3}>
          {eventoQuery.data ? (
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary">
                Status: {eventoQuery.data.status}
                {eventoQuery.data.empresaNome ? ` · Empresa: ${eventoQuery.data.empresaNome}` : ''}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Início: {formatDateTimePt(eventoQuery.data.dataInicio)} · Fim:{' '}
                {formatDateTimePt(eventoQuery.data.dataFim)}
              </Typography>
              {eventoQuery.data.whatsappContato ? (
                <Typography variant="body2" color="text.secondary">
                  WhatsApp: {eventoQuery.data.whatsappContato}
                </Typography>
              ) : null}
            </Box>
          ) : null}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard label="Pessoas que acessaram" value={metricasQuery.data?.visualizacoes ?? 0} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard label="Check-ins" value={metricasQuery.data?.checkins ?? 0} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard label="Favoritos" value={metricasQuery.data?.favoritos ?? 0} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard label="Cliques no WhatsApp" value={metricasQuery.data?.cliquesWhatsapp ?? 0} />
            </Grid>
          </Grid>
        </Stack>
      )}
    </Box>
  )
}
