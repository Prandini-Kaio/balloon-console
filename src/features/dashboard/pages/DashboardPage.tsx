import { useQuery } from '@tanstack/react-query'
import { Link as RouterLink } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from '@mui/material'
import { PageHeader } from '@/shared/ui/PageHeader'
import { StatCard } from '@/shared/ui/StatCard'
import { useAuth } from '@/core/auth/AuthContext'
import { hasAdminPermissao, isSuperAdmin } from '@/core/auth/mapUser'
import { fetchDashboardAdmin, fetchDashboardEmpresa } from '@/features/dashboard/dashboard.api'
import { isApiFailure } from '@/core/api/types'
import { formatDateTimePt } from '@/shared/lib/dateFormat'
import type { DashboardAdminOutput, DashboardEmpresaOutput } from '@/features/dashboard/types'

function alertaLabel(tipo: string): string {
  if (tipo === 'AVISO_7_DIAS') return 'Licença vence em 7 dias'
  if (tipo === 'AVISO_1_DIA') return 'Licença vence amanhã'
  if (tipo === 'VENCIDA') return 'Licença vencida'
  return tipo
}

function AdminDashboardView({ data }: { data: DashboardAdminOutput }) {
  return (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard label="Empresas ativas" value={data.empresasAtivas} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard label="Total empresas" value={data.totalEmpresas} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard label="Eventos ativos" value={data.eventosAtivos} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard label="Total eventos" value={data.totalEventos} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard label="Licenças vencendo" value={data.licencasVencendo} />
        </Grid>
      </Grid>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button component={RouterLink} to="/admin/empresas" variant="contained">
          Gerenciar empresas
        </Button>
        <Button component={RouterLink} to="/admin/licencas" variant="outlined">
          Ver licenças
        </Button>
        <Button component={RouterLink} to="/admin/eventos" variant="outlined">
          Ver eventos
        </Button>
      </Stack>
      {data.alertasRecentes?.length ? (
        <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" gutterBottom>
            Alertas recentes
          </Typography>
          <Stack spacing={1}>
            {data.alertasRecentes.map((a) => (
              <Typography key={a.id} variant="body2">
                {a.empresaNome}: {alertaLabel(a.tipo)} — {formatDateTimePt(a.emitidoEm)}
              </Typography>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Stack>
  )
}

function EmpresaDashboardView({ data }: { data: DashboardEmpresaOutput }) {
  return (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Total eventos" value={data.totalEventos} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Eventos ativos" value={data.eventosAtivos} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Finalizados" value={data.eventosFinalizados} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Licença"
            value={data.licencaResumo?.status ?? '—'}
            hint={
              data.licencaResumo?.diasRestantes != null
                ? `${data.licencaResumo.diasRestantes} dias restantes`
                : undefined
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Acessos" value={data.visualizacoesEstimadas ?? 0} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Check-ins" value={data.totalCheckins ?? 0} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Favoritos" value={data.totalFavoritos ?? 0} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Cliques WhatsApp" value={data.cliquesWhatsapp ?? 0} />
        </Grid>
      </Grid>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button component={RouterLink} to="/admin/eventos" variant="contained">
          Meus eventos
        </Button>
        <Button component={RouterLink} to="/admin/minha-licenca" variant="outlined">
          Minha licença
        </Button>
      </Stack>
      {data.proximosEventos?.length ? (
        <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" gutterBottom>
            Próximos eventos
          </Typography>
          <Stack spacing={1}>
            {data.proximosEventos.map((e) => (
              <Typography
                key={e.id}
                component={RouterLink}
                to={`/admin/eventos/${e.id}`}
                variant="body2"
                sx={{ color: 'primary.main', textDecoration: 'none' }}
              >
                {e.nome} — {formatDateTimePt(e.dataInicio)}
              </Typography>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Stack>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const admin = isSuperAdmin(user)
  const canAdminDashboard = hasAdminPermissao(user, 'DASHBOARD_ADMIN')

  const adminQuery = useQuery({
    queryKey: ['dashboard', 'admin'],
    enabled: admin && canAdminDashboard,
    queryFn: async () => {
      const res = await fetchDashboardAdmin()
      if (isApiFailure(res)) throw new Error(res.message)
      return res.data
    },
  })

  const empresaQuery = useQuery({
    queryKey: ['dashboard', 'empresa'],
    enabled: !admin,
    queryFn: async () => {
      const res = await fetchDashboardEmpresa()
      if (isApiFailure(res)) throw new Error(res.message)
      return res.data
    },
  })

  const query = admin ? adminQuery : empresaQuery

  return (
    <Box>
      <PageHeader
        title="Dashboard"
        subtitle={admin ? 'Visão geral da plataforma Balloon' : 'Resumo da sua empresa'}
      />
      {admin && !canAdminDashboard ? (
        <Alert severity="info">
          Sua conta não tem permissão de dashboard administrativo. Use o menu lateral para as áreas liberadas.
        </Alert>
      ) : query.isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : query.isError ? (
        <Alert severity="error">{(query.error as Error).message}</Alert>
      ) : admin && adminQuery.data ? (
        <AdminDashboardView data={adminQuery.data} />
      ) : empresaQuery.data ? (
        <EmpresaDashboardView data={empresaQuery.data} />
      ) : null}
    </Box>
  )
}
