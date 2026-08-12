import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  AppBar,
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material'
import { useAuth } from '@/core/auth/AuthContext'
import { isEmpresa, isSuperAdmin } from '@/core/auth/mapUser'
import { marcarAlertaLido } from '@/features/licenses/licenses.api'
import { BrandLogo } from '@/shared/ui/BrandLogo'
import { balloonColors } from '@/core/theme/tokens'
import { useLicencaStatusQuery } from '@/features/licenses/hooks/useLicencaStatus'
import { LicenseRenewalGate } from '@/features/licenses/components/LicenseRenewalGate'

const drawerWidth = 248

const adminNav = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/eventos', label: 'Eventos' },
  { to: '/admin/categorias', label: 'Categorias' },
  { to: '/admin/regioes-destaque', label: 'Regiões' },
  { to: '/admin/campanhas-destaque', label: 'Destaques no app' },
  { to: '/admin/empresas', label: 'Empresas' },
  { to: '/admin/licencas', label: 'Licenças' },
]

const empresaNav = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/eventos', label: 'Meus eventos' },
  { to: '/admin/minha-licenca', label: 'Minha licença' },
]

function alertaLabel(tipo: string): string {
  if (tipo === 'AVISO_7_DIAS') return 'Sua licença vence em 7 dias.'
  if (tipo === 'AVISO_1_DIA') return 'Sua licença vence amanhã.'
  if (tipo === 'VENCIDA') return 'Sua licença está vencida.'
  return 'Atenção à licença.'
}

export function AdminLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const qc = useQueryClient()
  const navItems = isSuperAdmin(user) ? adminNav : empresaNav
  const empresa = isEmpresa(user)

  const licencaQuery = useLicencaStatusQuery(empresa)

  const dismissMutation = useMutation({
    mutationFn: marcarAlertaLido,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['licenca-status'] }),
  })

  const alertas = licencaQuery.data?.alertasNaoLidos ?? []
  const primeiroAlerta = alertas[0]
  const onMinhaLicenca = location.pathname.startsWith('/admin/minha-licenca')
  const needsRenewal =
    empresa && licencaQuery.isSuccess && licencaQuery.data && licencaQuery.data.licencaAtiva === false

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar sx={{ gap: 2 }}>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <BrandLogo variant="icon" height={32} />
          </Box>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontFamily: 'Poppins, sans-serif' }}>
            {isSuperAdmin(user) ? 'Balloon Console' : 'Balloon Empresa'}
          </Typography>
          {user ? (
            <Typography variant="body2" color="inherit" sx={{ opacity: 0.9 }}>
              {user.name}
            </Typography>
          ) : null}
          <Button color="inherit" onClick={logout} size="small">
            Sair
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: `linear-gradient(180deg, ${balloonColors.white} 0%, ${balloonColors.surface} 100%)`,
          },
        }}
      >
        <Toolbar />
        <Box sx={{ px: 2, py: 2 }}>
          <BrandLogo variant="lateral" height={40} />
        </Box>
        <Divider />
        <List>
          {(needsRenewal
            ? empresaNav.filter((i) => i.to === '/admin/minha-licenca')
            : navItems
          ).map((item) => {
            const selected =
              location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
            return (
              <ListItemButton
                key={item.to}
                component={RouterLink}
                to={item.to}
                selected={selected}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  '&.Mui-selected': {
                    bgcolor: 'rgba(32, 100, 172, 0.12)',
                    color: balloonColors.navy,
                  },
                }}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            )
          })}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        {empresa && licencaQuery.isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : needsRenewal && !onMinhaLicenca && licencaQuery.data ? (
          <LicenseRenewalGate status={licencaQuery.data} />
        ) : (
          <>
            {primeiroAlerta && !needsRenewal ? (
              <Alert
                severity={primeiroAlerta.tipo === 'VENCIDA' ? 'error' : 'warning'}
                sx={{ mb: 2 }}
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => dismissMutation.mutate(primeiroAlerta.id)}
                  >
                    Dispensar
                  </Button>
                }
              >
                {alertaLabel(primeiroAlerta.tipo)}
              </Alert>
            ) : null}
            <Outlet />
          </>
        )}
      </Box>
    </Box>
  )
}
