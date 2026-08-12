import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Box, Button, CircularProgress, Divider, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { PageHeader } from '@/shared/ui/PageHeader'
import { createCompany, getCompany, updateCompany } from '@/features/companies/companies.api'

export function CompanyFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const isEdit = Boolean(id)
  const empresaId = Number(id)

  const [nome, setNome] = useState('')
  const [emailContato, setEmailContato] = useState('')
  const [status, setStatus] = useState<'ATIVA' | 'INATIVA' | 'SUSPENSA'>('ATIVA')
  const [usuarioNome, setUsuarioNome] = useState('')
  const [usuarioEmail, setUsuarioEmail] = useState('')
  const [usuarioSenha, setUsuarioSenha] = useState('')
  const [licPlano, setLicPlano] = useState<'TRIAL' | 'MENSAL' | 'ANUAL'>('TRIAL')
  const [licInicio, setLicInicio] = useState('')
  const [licFim, setLicFim] = useState('')

  const companyQuery = useQuery({
    queryKey: ['company', empresaId],
    enabled: isEdit && Number.isFinite(empresaId),
    queryFn: () => getCompany(empresaId),
  })

  useEffect(() => {
    if (!companyQuery.data) return
    queueMicrotask(() => {
      setNome(companyQuery.data!.nome)
      setEmailContato(companyQuery.data!.emailContato ?? '')
      setStatus(companyQuery.data!.status)
    })
  }, [companyQuery.data])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const trimmed = nome.trim()
      if (!trimmed) throw new Error('Informe o nome')
      if (isEdit) {
        return updateCompany(empresaId, {
          nome: trimmed,
          emailContato: emailContato.trim() || undefined,
          status,
        })
      }
      if (!usuarioNome.trim() || !usuarioEmail.trim() || !usuarioSenha.trim()) {
        throw new Error('Preencha os dados do primeiro usuário')
      }
      return createCompany({
        nome: trimmed,
        emailContato: emailContato.trim() || undefined,
        usuarioNome: usuarioNome.trim(),
        usuarioEmail: usuarioEmail.trim(),
        usuarioSenha: usuarioSenha,
        licencaInicial:
          licInicio && licFim
            ? { plano: licPlano, dataInicio: licInicio, dataFim: licFim }
            : undefined,
      })
    },
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['companies'] })
      navigate(isEdit ? `/admin/empresas/${empresaId}` : `/admin/empresas/${data.id}`)
    },
  })

  return (
    <Box>
      <PageHeader title={isEdit ? 'Editar empresa' : 'Nova empresa'} />
      {companyQuery.isError ? (
        <Alert severity="error">{(companyQuery.error as Error).message}</Alert>
      ) : null}
      {isEdit && companyQuery.isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : null}
      {isEdit && companyQuery.isLoading ? null : (
        <Stack spacing={2} sx={{ maxWidth: 520, mt: 2 }} component="form">
          <TextField label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required fullWidth />
          <TextField label="E-mail de contato" value={emailContato} onChange={(e) => setEmailContato(e.target.value)} fullWidth />
          {isEdit ? (
            <TextField
              select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              fullWidth
            >
              <MenuItem value="ATIVA">ATIVA</MenuItem>
              <MenuItem value="INATIVA">INATIVA</MenuItem>
              <MenuItem value="SUSPENSA">SUSPENSA</MenuItem>
            </TextField>
          ) : (
            <>
              <Divider />
              <Typography variant="subtitle1">Primeiro usuário</Typography>
              <TextField label="Nome do usuário" value={usuarioNome} onChange={(e) => setUsuarioNome(e.target.value)} required fullWidth />
              <TextField label="E-mail do usuário" type="email" value={usuarioEmail} onChange={(e) => setUsuarioEmail(e.target.value)} required fullWidth />
              <TextField label="Senha" type="password" value={usuarioSenha} onChange={(e) => setUsuarioSenha(e.target.value)} required fullWidth />
              <Divider />
              <Typography variant="subtitle1">Licença inicial (opcional)</Typography>
              <TextField select label="Plano" value={licPlano} onChange={(e) => setLicPlano(e.target.value as typeof licPlano)} fullWidth>
                <MenuItem value="TRIAL">TRIAL</MenuItem>
                <MenuItem value="MENSAL">MENSAL</MenuItem>
                <MenuItem value="ANUAL">ANUAL</MenuItem>
              </TextField>
              <TextField label="Início" type="date" slotProps={{ inputLabel: { shrink: true } }} value={licInicio} onChange={(e) => setLicInicio(e.target.value)} fullWidth />
              <TextField label="Fim" type="date" slotProps={{ inputLabel: { shrink: true } }} value={licFim} onChange={(e) => setLicFim(e.target.value)} fullWidth />
            </>
          )}
          {saveMutation.isError ? (
            <Alert severity="error">{(saveMutation.error as Error).message}</Alert>
          ) : null}
          <Stack direction="row" spacing={2}>
            <Button variant="contained" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
              {saveMutation.isPending ? 'Salvando…' : 'Salvar'}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/admin/empresas')}>
              Cancelar
            </Button>
          </Stack>
        </Stack>
      )}
    </Box>
  )
}
