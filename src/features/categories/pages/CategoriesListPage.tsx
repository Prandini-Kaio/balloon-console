import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material'
import { useState } from 'react'
import { PageHeader } from '@/shared/ui/PageHeader'
import { EmptyState } from '@/shared/ui/EmptyState'
import { createCategoria, listCategorias } from '@/features/categories/categories.api'
import { isApiFailure } from '@/core/api/types'

export function CategoriesListPage() {
  const qc = useQueryClient()
  const [nome, setNome] = useState('')
  const query = useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const res = await listCategorias()
      if (isApiFailure(res)) throw new Error(res.message)
      return res.data ?? []
    },
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const trimmed = nome.trim()
      if (!trimmed) throw new Error('Informe o nome')
      const res = await createCategoria({ nome: trimmed })
      if (isApiFailure(res)) throw new Error(res.message)
    },
    onSuccess: () => {
      setNome('')
      qc.invalidateQueries({ queryKey: ['categorias'] })
    },
  })

  return (
    <Box>
      <PageHeader
        title="Categorias"
        subtitle="Categorias de eventos usadas no cadastro"
        actions={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              label="Nova categoria"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={createMutation.isPending}
            />
            <Button
              variant="contained"
              disabled={createMutation.isPending || !nome.trim()}
              onClick={() => createMutation.mutate()}
            >
              Adicionar
            </Button>
          </Box>
        }
      />
      {createMutation.isError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(createMutation.error as Error).message}
        </Alert>
      ) : null}
      {query.isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : query.isError ? (
        <Alert severity="error">{(query.error as Error).message}</Alert>
      ) : !query.data?.length ? (
        <EmptyState title="Nenhuma categoria cadastrada" />
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Id</TableCell>
                <TableCell>Nome</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {query.data.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.nome}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
