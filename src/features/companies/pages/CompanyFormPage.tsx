import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Box, Button, CircularProgress, Stack, TextField } from '@mui/material'
import { PageHeader } from '@/shared/ui/PageHeader'
import { createCompany, getCompany, updateCompany } from '@/features/companies/companies.api'

export function CompanyFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const isEdit = Boolean(id)
  const [name, setName] = useState('')

  const companyQuery = useQuery({
    queryKey: ['company', id],
    enabled: isEdit,
    queryFn: async () => {
      const c = await getCompany(id!)
      if (!c) throw new Error('Empresa não encontrada')
      return c
    },
  })

  useEffect(() => {
    if (!companyQuery.data) return
    queueMicrotask(() => setName(companyQuery.data!.name))
  }, [companyQuery.data])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const trimmed = name.trim()
      if (!trimmed) throw new Error('Informe o nome')
      if (isEdit) {
        const updated = await updateCompany(id!, { name: trimmed })
        if (!updated) throw new Error('Empresa não encontrada')
        return updated
      }
      return createCompany({ name: trimmed })
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['companies'] })
      navigate('/admin/empresas')
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
        <Stack spacing={2} sx={{ maxWidth: 480, mt: 2 }} component="form">
          <TextField
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />
          {saveMutation.isError ? (
            <Alert severity="error">{(saveMutation.error as Error).message}</Alert>
          ) : null}
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              disabled={saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
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
