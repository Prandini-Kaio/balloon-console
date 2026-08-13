import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { PageHeader } from '@/shared/ui/PageHeader'
import { EmptyState } from '@/shared/ui/EmptyState'
import { isApiFailure } from '@/core/api/types'
import { formatDateTimePt } from '@/shared/lib/dateFormat'
import { listCompanies } from '@/features/companies/companies.api'
import {
  cancelarLicenca,
  createLicenca,
  deleteLicenca,
  fetchLicencaAlertasAdmin,
  listLicencasAdmin,
  listPlanosConfig,
  renovarLicenca,
  updateLicenca,
  updatePlanoConfig,
} from '@/features/licenses/licenses.api'
import {
  LimitesFields,
  PermissoesCheckboxGroup,
  parseOptionalInt,
} from '@/features/licenses/components/PoliticaFields'
import type {
  LicencaOutput,
  LicencaPermissao,
  LicencaPlano,
  LicencaPlanoConfig,
  LicencaStatus,
} from '@/features/licenses/types'
import { PERMISSAO_LABELS } from '@/features/licenses/types'

function alertaLabel(tipo: string): string {
  if (tipo === 'AVISO_7_DIAS') return 'Vence em 7 dias'
  if (tipo === 'AVISO_1_DIA') return 'Vence amanhã'
  if (tipo === 'VENCIDA') return 'Vencida'
  return tipo
}

function centavosToReaisInput(centavos: number | null | undefined): string {
  const value = centavos == null ? 0 : centavos
  return (value / 100).toFixed(2).replace('.', ',')
}

function reaisToCentavos(raw: string): number {
  const normalized = raw.trim().replace(/\s/g, '').replace(/\./g, '').replace(',', '.')
  const reais = Number(normalized)
  if (!Number.isFinite(reais)) return Number.NaN
  return Math.round(reais * 100)
}

function defaultRenewDates() {
  const start = new Date()
  const end = new Date()
  end.setMonth(end.getMonth() + 1)
  return {
    dataInicio: start.toISOString().slice(0, 10),
    dataFim: end.toISOString().slice(0, 10),
  }
}

export function LicensesPage() {
  const [tab, setTab] = useState(0)
  const [statusFilter, setStatusFilter] = useState<LicencaStatus | ''>('')
  const [planoFilter, setPlanoFilter] = useState<LicencaPlano | ''>('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editLicenca, setEditLicenca] = useState<LicencaOutput | null>(null)
  const [renewLicenca, setRenewLicenca] = useState<LicencaOutput | null>(null)
  const qc = useQueryClient()

  const licencasQuery = useQuery({
    queryKey: ['licencas-admin', statusFilter, planoFilter],
    queryFn: async () => {
      const res = await listLicencasAdmin({
        status: statusFilter || undefined,
        plano: planoFilter || undefined,
      })
      if (isApiFailure(res)) throw new Error(res.message)
      return res.data
    },
  })

  const alertasQuery = useQuery({
    queryKey: ['licenca-alertas-admin'],
    queryFn: async () => {
      const res = await fetchLicencaAlertasAdmin()
      if (isApiFailure(res)) throw new Error(res.message)
      return res.data
    },
  })

  const planosQuery = useQuery({
    queryKey: ['licenca-planos'],
    queryFn: async () => {
      const res = await listPlanosConfig()
      if (isApiFailure(res)) throw new Error(res.message)
      return res.data
    },
  })

  const cancelMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await cancelarLicenca(id)
      if (isApiFailure(res)) throw new Error(res.message)
      return res.data
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['licencas-admin'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await deleteLicenca(id)
      if (isApiFailure(res)) throw new Error(res.message)
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['licencas-admin'] }),
  })

  return (
    <Box>
      <PageHeader
        title="Licenças"
        subtitle="Gestão global, planos e alertas"
        actions={
          tab === 0 ? (
            <Button variant="contained" onClick={() => setCreateOpen(true)}>
              Nova licença
            </Button>
          ) : null
        }
      />
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Licenças" />
        <Tab label="Planos" />
        <Tab label="Alertas" />
      </Tabs>

      {tab === 0 ? (
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LicencaStatus | '')}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="ATIVA">Ativa</MenuItem>
              <MenuItem value="PENDENTE">Pendente</MenuItem>
              <MenuItem value="VENCIDA">Vencida</MenuItem>
              <MenuItem value="CANCELADA">Cancelada</MenuItem>
            </TextField>
            <TextField
              select
              size="small"
              label="Plano"
              value={planoFilter}
              onChange={(e) => setPlanoFilter(e.target.value as LicencaPlano | '')}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="TRIAL">Trial</MenuItem>
              <MenuItem value="MENSAL">Mensal</MenuItem>
              <MenuItem value="ANUAL">Anual</MenuItem>
            </TextField>
          </Stack>
          {licencasQuery.isLoading ? (
            <CircularProgress />
          ) : licencasQuery.isError ? (
            <Alert severity="error">{(licencasQuery.error as Error).message}</Alert>
          ) : !licencasQuery.data?.length ? (
            <EmptyState title="Nenhuma licença encontrada" />
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Empresa</TableCell>
                    <TableCell>Plano</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Vigência</TableCell>
                    <TableCell>Máx. eventos</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {licencasQuery.data.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.empresaNome}</TableCell>
                      <TableCell>{row.plano}</TableCell>
                      <TableCell>
                        <Chip size="small" label={row.status} />
                      </TableCell>
                      <TableCell>
                        {row.dataInicio} → {row.dataFim}
                      </TableCell>
                      <TableCell>{row.politicaEfetiva?.maxEventos ?? '∞'}</TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => setEditLicenca(row)}>
                          Editar
                        </Button>
                        <Button size="small" onClick={() => setRenewLicenca(row)}>
                          Renovar
                        </Button>
                        {row.status === 'ATIVA' ? (
                          <Button
                            size="small"
                            color="warning"
                            onClick={() => {
                              if (window.confirm('Cancelar licença e desativar eventos?')) {
                                cancelMutation.mutate(row.id)
                              }
                            }}
                          >
                            Cancelar
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            color="error"
                            onClick={() => {
                              if (window.confirm('Excluir esta licença?')) {
                                deleteMutation.mutate(row.id)
                              }
                            }}
                          >
                            Excluir
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Stack>
      ) : null}

      {tab === 1 ? (
        planosQuery.isLoading ? (
          <CircularProgress />
        ) : planosQuery.isError ? (
          <Alert severity="error">{(planosQuery.error as Error).message}</Alert>
        ) : (
          <Stack spacing={2}>
            {(planosQuery.data ?? []).map((plano) => (
              <PlanoEditor
                key={plano.plano}
                config={plano}
                onSaved={() => void qc.invalidateQueries({ queryKey: ['licenca-planos'] })}
              />
            ))}
          </Stack>
        )
      ) : null}

      {tab === 2 ? (
        alertasQuery.isLoading ? (
          <CircularProgress />
        ) : alertasQuery.isError ? (
          <Alert severity="error">{(alertasQuery.error as Error).message}</Alert>
        ) : !alertasQuery.data?.length ? (
          <EmptyState title="Nenhum alerta pendente" />
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Empresa</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Emitido em</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alertasQuery.data.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.empresaNome}</TableCell>
                    <TableCell>{alertaLabel(row.tipo)}</TableCell>
                    <TableCell>{formatDateTimePt(row.emitidoEm)}</TableCell>
                    <TableCell>
                      <Chip size="small" label={row.lido ? 'Lido' : 'Pendente'} color={row.lido ? 'default' : 'warning'} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      ) : null}

      <CreateLicencaDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <EditLicencaDialog
        licenca={editLicenca}
        onClose={() => setEditLicenca(null)}
      />
      <RenewLicencaDialog
        licenca={renewLicenca}
        onClose={() => setRenewLicenca(null)}
      />
    </Box>
  )
}

function PlanoEditor({ config, onSaved }: { config: LicencaPlanoConfig; onSaved: () => void }) {
  const [maxEventos, setMaxEventos] = useState(config.maxEventos?.toString() ?? '')
  const [maxUsuarios, setMaxUsuarios] = useState(config.maxUsuarios?.toString() ?? '')
  const [valorReais, setValorReais] = useState(centavosToReaisInput(config.valorCentavos))
  const [periodoDias, setPeriodoDias] = useState(String(config.periodoDias ?? ''))
  const [permissoes, setPermissoes] = useState<LicencaPermissao[]>(config.permissoes)
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: async () => {
      const valorCentavos = reaisToCentavos(valorReais)
      const dias = Number(periodoDias)
      if (!Number.isFinite(valorCentavos) || valorCentavos < 0) {
        throw new Error('Informe um preço válido')
      }
      if (!Number.isFinite(dias) || dias < 1) {
        throw new Error('Informe o período em dias')
      }
      const res = await updatePlanoConfig(config.plano, {
        maxEventos: parseOptionalInt(maxEventos),
        maxUsuarios: parseOptionalInt(maxUsuarios),
        permissoes,
        valorCentavos,
        periodoDias: dias,
      })
      if (isApiFailure(res)) throw new Error(res.message)
      return res.data
    },
    onSuccess: () => onSaved(),
    onError: (e: Error) => setError(e.message),
  })

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Plano {config.plano}
      </Typography>
      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Preço (R$)"
            value={valorReais}
            onChange={(e) => setValorReais(e.target.value)}
            size="small"
            fullWidth
            helperText="Valor cobrado no checkout. Trial use 0."
          />
          <TextField
            label="Período (dias)"
            value={periodoDias}
            onChange={(e) => setPeriodoDias(e.target.value)}
            size="small"
            type="number"
            fullWidth
          />
        </Stack>
        <LimitesFields
          maxEventos={maxEventos}
          maxUsuarios={maxUsuarios}
          onMaxEventos={setMaxEventos}
          onMaxUsuarios={setMaxUsuarios}
        />
        <PermissoesCheckboxGroup permissoes={permissoes} onChange={setPermissoes} />
        <Box>
          <Button variant="contained" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
            Salvar plano
          </Button>
        </Box>
      </Stack>
    </Paper>
  )
}

function CreateLicencaDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient()
  const dates = useMemo(() => defaultRenewDates(), [open])
  const [empresaId, setEmpresaId] = useState('')
  const [plano, setPlano] = useState<LicencaPlano>('MENSAL')
  const [dataInicio, setDataInicio] = useState(dates.dataInicio)
  const [dataFim, setDataFim] = useState(dates.dataFim)
  const [maxEventos, setMaxEventos] = useState('')
  const [maxUsuarios, setMaxUsuarios] = useState('')
  const [permissoes, setPermissoes] = useState<LicencaPermissao[]>([])
  const [error, setError] = useState<string | null>(null)

  const companiesQuery = useQuery({
    queryKey: ['companies'],
    enabled: open,
    queryFn: listCompanies,
  })

  const mutation = useMutation({
    mutationFn: async () => {
      const id = Number(empresaId)
      const res = await createLicenca(id, {
        plano,
        dataInicio,
        dataFim,
        maxEventosOverride: parseOptionalInt(maxEventos),
        maxUsuariosOverride: parseOptionalInt(maxUsuarios),
        permissoesOverride: permissoes.length ? permissoes : null,
      })
      if (isApiFailure(res)) throw new Error(res.message)
      return res.data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['licencas-admin'] })
      onClose()
    },
    onError: (e: Error) => setError(e.message),
  })

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nova licença</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField
            select
            label="Empresa"
            value={empresaId}
            onChange={(e) => setEmpresaId(e.target.value)}
            fullWidth
          >
            {(companiesQuery.data ?? []).map((c) => (
              <MenuItem key={c.id} value={String(c.id)}>
                {c.nome}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Plano" value={plano} onChange={(e) => setPlano(e.target.value as LicencaPlano)}>
            <MenuItem value="TRIAL">Trial</MenuItem>
            <MenuItem value="MENSAL">Mensal</MenuItem>
            <MenuItem value="ANUAL">Anual</MenuItem>
          </TextField>
          <TextField label="Início" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          <TextField label="Fim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          <Typography variant="body2" color="text.secondary">
            Overrides opcionais (só esta empresa)
          </Typography>
          <LimitesFields maxEventos={maxEventos} maxUsuarios={maxUsuarios} onMaxEventos={setMaxEventos} onMaxUsuarios={setMaxUsuarios} />
          <PermissoesCheckboxGroup permissoes={permissoes} onChange={setPermissoes} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" disabled={!empresaId || mutation.isPending} onClick={() => mutation.mutate()}>
          Criar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function EditLicencaDialog({
  licenca,
  onClose,
}: {
  licenca: LicencaOutput | null
  onClose: () => void
}) {
  const qc = useQueryClient()
  const [plano, setPlano] = useState<LicencaPlano>('MENSAL')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [maxEventos, setMaxEventos] = useState('')
  const [maxUsuarios, setMaxUsuarios] = useState('')
  const [permissoes, setPermissoes] = useState<LicencaPermissao[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!licenca) return
    setPlano(licenca.plano)
    setDataInicio(licenca.dataInicio)
    setDataFim(licenca.dataFim)
    setMaxEventos(licenca.maxEventosOverride?.toString() ?? '')
    setMaxUsuarios(licenca.maxUsuariosOverride?.toString() ?? '')
    setPermissoes(licenca.permissoesOverride ?? [])
    setError(null)
  }, [licenca])

  const mutation = useMutation({
    mutationFn: async () => {
      if (!licenca) throw new Error('Licença inválida')
      const res = await updateLicenca(licenca.id, {
        plano,
        dataInicio,
        dataFim,
        maxEventosOverride: parseOptionalInt(maxEventos),
        maxUsuariosOverride: parseOptionalInt(maxUsuarios),
        permissoesOverride: permissoes,
      })
      if (isApiFailure(res)) throw new Error(res.message)
      return res.data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['licencas-admin'] })
      onClose()
    },
    onError: (e: Error) => setError(e.message),
  })

  const clearMutation = useMutation({
    mutationFn: async () => {
      if (!licenca) throw new Error('Licença inválida')
      const res = await updateLicenca(licenca.id, { limparOverrides: true })
      if (isApiFailure(res)) throw new Error(res.message)
      return res.data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['licencas-admin'] })
      onClose()
    },
  })

  return (
    <Dialog open={!!licenca} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar licença #{licenca?.id}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          {licenca?.politicaEfetiva ? (
            <Typography variant="body2" color="text.secondary">
              Efetivo: máx. eventos {licenca.politicaEfetiva.maxEventos ?? '∞'} · permissões:{' '}
              {licenca.politicaEfetiva.permissoes.map((p) => PERMISSAO_LABELS[p]).join(', ')}
            </Typography>
          ) : null}
          <TextField select label="Plano" value={plano} onChange={(e) => setPlano(e.target.value as LicencaPlano)}>
            <MenuItem value="TRIAL">Trial</MenuItem>
            <MenuItem value="MENSAL">Mensal</MenuItem>
            <MenuItem value="ANUAL">Anual</MenuItem>
          </TextField>
          <TextField label="Início" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          <TextField label="Fim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          <LimitesFields maxEventos={maxEventos} maxUsuarios={maxUsuarios} onMaxEventos={setMaxEventos} onMaxUsuarios={setMaxUsuarios} />
          <PermissoesCheckboxGroup permissoes={permissoes} onChange={setPermissoes} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => clearMutation.mutate()} color="inherit">
          Limpar overrides
        </Button>
        <Button onClick={onClose}>Fechar</Button>
        <Button variant="contained" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function RenewLicencaDialog({
  licenca,
  onClose,
}: {
  licenca: LicencaOutput | null
  onClose: () => void
}) {
  const qc = useQueryClient()
  const dates = useMemo(() => defaultRenewDates(), [licenca])
  const [plano, setPlano] = useState<LicencaPlano>('MENSAL')
  const [dataInicio, setDataInicio] = useState(dates.dataInicio)
  const [dataFim, setDataFim] = useState(dates.dataFim)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!licenca) return
    setPlano(licenca.plano)
    setDataInicio(dates.dataInicio)
    setDataFim(dates.dataFim)
    setError(null)
  }, [licenca, dates])

  const mutation = useMutation({
    mutationFn: async () => {
      if (!licenca) throw new Error('Licença inválida')
      const res = await renovarLicenca(licenca.id, { plano, dataInicio, dataFim })
      if (isApiFailure(res)) throw new Error(res.message)
      return res.data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['licencas-admin'] })
      onClose()
    },
    onError: (e: Error) => setError(e.message),
  })

  return (
    <Dialog open={!!licenca} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Renovar licença</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Typography variant="body2">{licenca?.empresaNome}</Typography>
          <TextField select label="Plano" value={plano} onChange={(e) => setPlano(e.target.value as LicencaPlano)}>
            <MenuItem value="TRIAL">Trial</MenuItem>
            <MenuItem value="MENSAL">Mensal</MenuItem>
            <MenuItem value="ANUAL">Anual</MenuItem>
          </TextField>
          <TextField label="Início" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          <TextField label="Fim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
          Renovar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
