import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link as RouterLink, useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { PageHeader } from '@/shared/ui/PageHeader'
import {
  createCompanyUser,
  getCompany,
  listCompanyLicencas,
  listCompanyUsers,
} from '@/features/companies/companies.api'
import { createLicenca, reativarEventosEmpresa } from '@/features/licenses/licenses.api'
import { isApiFailure } from '@/core/api/types'
import { formatDateTimePt } from '@/shared/lib/dateFormat'
import { useEventsPageQuery } from '@/features/events/hooks/useEventsPageQuery'

export function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const empresaId = Number(id)
  const qc = useQueryClient()
  const [usuarioNome, setUsuarioNome] = useState('')
  const [usuarioEmail, setUsuarioEmail] = useState('')
  const [usuarioSenha, setUsuarioSenha] = useState('')
  const [licPlano, setLicPlano] = useState<'TRIAL' | 'MENSAL' | 'ANUAL'>('TRIAL')
  const [licInicio, setLicInicio] = useState('')
  const [licFim, setLicFim] = useState('')

  const companyQuery = useQuery({
    queryKey: ['company', empresaId],
    enabled: Number.isFinite(empresaId),
    queryFn: () => getCompany(empresaId),
  })

  const usersQuery = useQuery({
    queryKey: ['company-users', empresaId],
    enabled: Number.isFinite(empresaId),
    queryFn: () => listCompanyUsers(empresaId),
  })

  const licencasQuery = useQuery({
    queryKey: ['company-licencas', empresaId],
    enabled: Number.isFinite(empresaId),
    queryFn: () => listCompanyLicencas(empresaId),
  })

  const eventsQuery = useEventsPageQuery(
    { empresaId: Number.isFinite(empresaId) ? empresaId : undefined },
    0,
    20,
  )

  const userMutation = useMutation({
    mutationFn: () => createCompanyUser(empresaId, { nome: usuarioNome, email: usuarioEmail, senha: usuarioSenha }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['company-users', empresaId] })
      setUsuarioNome('')
      setUsuarioEmail('')
      setUsuarioSenha('')
    },
  })

  const licencaMutation = useMutation({
    mutationFn: () =>
      createLicenca(empresaId, { plano: licPlano, dataInicio: licInicio, dataFim: licFim }).then((res) => {
        if (isApiFailure(res)) throw new Error(res.message)
        return res.data
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['company-licencas', empresaId] })
      void qc.invalidateQueries({ queryKey: ['company', empresaId] })
    },
  })

  const reativarMutation = useMutation({
    mutationFn: async () => {
      const res = await reativarEventosEmpresa(empresaId)
      if (isApiFailure(res)) throw new Error(res.message)
      return res.data
    },
    onSuccess: (data) => {
      window.alert(`${data.reativados} evento(s) reativado(s).`)
      void qc.invalidateQueries({ queryKey: ['events'] })
    },
  })

  if (!Number.isFinite(empresaId)) {
    return <Alert severity="error">Identificador inválido</Alert>
  }

  return (
    <Box>
      <PageHeader
        title={companyQuery.data?.nome ?? 'Empresa'}
        subtitle="Eventos, usuários e licenças"
        actions={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              disabled={reativarMutation.isPending}
              onClick={() => {
                if (window.confirm('Reativar todos os eventos INATIVO desta empresa?')) {
                  reativarMutation.mutate()
                }
              }}
            >
              Reativar eventos
            </Button>
            <Button component={RouterLink} to={`/admin/empresas/${empresaId}/editar`} variant="outlined">
              Editar
            </Button>
          </Stack>
        }
      />
      {companyQuery.isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : companyQuery.data ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Status: {companyQuery.data.status} · Usuários: {companyQuery.data.totalUsuarios}
          {companyQuery.data.licencaStatus ? ` · Licença: ${companyQuery.data.licencaStatus}` : ''}
        </Typography>
      ) : null}

      <Typography variant="h6" sx={{ mt: 1, mb: 1 }}>
        Eventos da empresa
      </Typography>
      {eventsQuery.isLoading ? (
        <CircularProgress size={24} />
      ) : eventsQuery.isError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {eventsQuery.error.message}
        </Alert>
      ) : !eventsQuery.data?.content.length ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Nenhum evento cadastrado para esta empresa.
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Início</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {eventsQuery.data.content.map((e) => (
                <TableRow key={e.id} hover>
                  <TableCell>{e.nome}</TableCell>
                  <TableCell>{e.status}</TableCell>
                  <TableCell>{formatDateTimePt(e.dataInicio)}</TableCell>
                  <TableCell align="right">
                    <Button component={RouterLink} to={`/admin/eventos/${e.id}`} size="small">
                      Métricas
                    </Button>
                    <Button
                      component={RouterLink}
                      to={`/admin/eventos/${e.id}/editar`}
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
        Usuários
      </Typography>
      {usersQuery.isLoading ? (
        <CircularProgress size={24} />
      ) : (
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>E-mail</TableCell>
                <TableCell>Ativo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(usersQuery.data ?? []).map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.nome}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.ativo ? 'Sim' : 'Não'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Stack direction="row" spacing={1} sx={{ mb: 4, maxWidth: 720, flexWrap: 'wrap' }}>
        <TextField size="small" label="Nome" value={usuarioNome} onChange={(e) => setUsuarioNome(e.target.value)} />
        <TextField
          size="small"
          label="E-mail"
          value={usuarioEmail}
          onChange={(e) => setUsuarioEmail(e.target.value)}
        />
        <TextField
          size="small"
          label="Senha"
          type="password"
          value={usuarioSenha}
          onChange={(e) => setUsuarioSenha(e.target.value)}
        />
        <Button variant="contained" disabled={userMutation.isPending} onClick={() => userMutation.mutate()}>
          Adicionar
        </Button>
      </Stack>

      <Typography variant="h6" sx={{ mb: 1 }}>
        Licenças
      </Typography>
      {licencasQuery.isLoading ? (
        <CircularProgress size={24} />
      ) : (
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Plano</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Início</TableCell>
                <TableCell>Fim</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(licencasQuery.data ?? []).map((l) => (
                <TableRow key={l.id}>
                  <TableCell>{l.plano}</TableCell>
                  <TableCell>{l.status}</TableCell>
                  <TableCell>{l.dataInicio}</TableCell>
                  <TableCell>{l.dataFim}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Stack direction="row" spacing={1} sx={{ maxWidth: 720, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          select
          label="Plano"
          value={licPlano}
          onChange={(e) => setLicPlano(e.target.value as typeof licPlano)}
        >
          <MenuItem value="TRIAL">TRIAL</MenuItem>
          <MenuItem value="MENSAL">MENSAL</MenuItem>
          <MenuItem value="ANUAL">ANUAL</MenuItem>
        </TextField>
        <TextField
          size="small"
          label="Início"
          type="date"
          slotProps={{ inputLabel: { shrink: true } }}
          value={licInicio}
          onChange={(e) => setLicInicio(e.target.value)}
        />
        <TextField
          size="small"
          label="Fim"
          type="date"
          slotProps={{ inputLabel: { shrink: true } }}
          value={licFim}
          onChange={(e) => setLicFim(e.target.value)}
        />
        <Button variant="contained" disabled={licencaMutation.isPending} onClick={() => licencaMutation.mutate()}>
          Registrar licença
        </Button>
      </Stack>
    </Box>
  )
}
