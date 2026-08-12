import { Alert, Box, Button, Chip, CircularProgress, Grid, Stack, Typography } from '@mui/material'
import { PageHeader } from '@/shared/ui/PageHeader'
import { StatCard } from '@/shared/ui/StatCard'
import { formatDateTimePt } from '@/shared/lib/dateFormat'
import { useLicencaStatusQuery } from '@/features/licenses/hooks/useLicencaStatus'
import { PERMISSAO_LABELS } from '@/features/licenses/types'

function alertaLabel(tipo: string): string {
  if (tipo === 'AVISO_7_DIAS') return 'Vence em 7 dias'
  if (tipo === 'AVISO_1_DIA') return 'Vence amanhã'
  if (tipo === 'VENCIDA') return 'Vencida'
  return tipo
}

export function MyLicensePage() {
  const query = useLicencaStatusQuery()

  return (
    <Box>
      <PageHeader title="Minha licença" subtitle="Informações do seu plano Balloon" />
      {query.isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : query.isError ? (
        <Alert severity="error">{(query.error as Error).message}</Alert>
      ) : (
        <Stack spacing={3}>
          {!query.data?.licencaAtiva ? (
            <Alert
              severity="error"
              action={
                query.data?.renewUrl ? (
                  <Button
                    color="inherit"
                    size="small"
                    href={query.data.renewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Renovar
                  </Button>
                ) : null
              }
            >
              Licença inativa. Renove para voltar a gerenciar eventos.
            </Alert>
          ) : null}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatCard label="Plano" value={query.data?.plano ?? '—'} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatCard label="Status" value={query.data?.status ?? '—'} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatCard label="Dias restantes" value={query.data?.diasRestantes ?? '—'} />
            </Grid>
          </Grid>
          {query.data?.politica ? (
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" gutterBottom>
                Política efetiva
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Máx. eventos: {query.data.politica.maxEventos ?? 'Ilimitado'} · Máx. usuários:{' '}
                {query.data.politica.maxUsuarios ?? 'Ilimitado'}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {query.data.politica.permissoes.map((p) => (
                  <Chip key={p} size="small" label={PERMISSAO_LABELS[p]} />
                ))}
              </Box>
            </Box>
          ) : null}
          <Box>
            <Typography variant="h6" gutterBottom>
              Alertas
            </Typography>
            {!query.data?.alertasNaoLidos?.length ? (
              <Typography variant="body2" color="text.secondary">
                Nenhum alerta pendente.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {query.data.alertasNaoLidos.map((a) => (
                  <Chip
                    key={a.id}
                    color={a.tipo === 'VENCIDA' ? 'error' : 'warning'}
                    label={`${alertaLabel(a.tipo)} · ${formatDateTimePt(a.emitidoEm)}`}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Stack>
      )}
    </Box>
  )
}
