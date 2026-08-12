import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link as RouterLink } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { PageHeader } from '@/shared/ui/PageHeader'
import { EmptyState } from '@/shared/ui/EmptyState'
import { deleteCompany, listCompanies } from '@/features/companies/companies.api'

export function CompaniesListPage() {
  const qc = useQueryClient()
  const query = useQuery({ queryKey: ['companies'], queryFn: listCompanies })
  const removeMutation = useMutation({
    mutationFn: deleteCompany,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['companies'] }),
  })

  async function onRemove(id: number, name: string) {
    if (!window.confirm(`Remover "${name}"?`)) return
    try {
      await removeMutation.mutateAsync(id)
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Erro ao remover')
    }
  }

  return (
    <Box>
      <PageHeader
        title="Empresas"
        subtitle="Contas empresariais e licenças SaaS"
        actions={
          <Button component={RouterLink} to="/admin/empresas/nova" variant="contained">
            Nova empresa
          </Button>
        }
      />
      {query.isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : query.isError ? (
        <Alert severity="error">{(query.error as Error).message}</Alert>
      ) : !query.data?.length ? (
        <EmptyState title="Nenhuma empresa cadastrada" />
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Licença</TableCell>
                <TableCell>Usuários</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {query.data.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.nome}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>
                    {row.licencaStatus ? (
                      <Chip size="small" label={row.licencaStatus} color={row.licencaStatus === 'ATIVA' ? 'success' : 'warning'} />
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>{row.totalUsuarios}</TableCell>
                  <TableCell align="right">
                    <Button component={RouterLink} to={`/admin/empresas/${row.id}`} size="small">
                      Detalhe
                    </Button>
                    <Button component={RouterLink} to={`/admin/empresas/${row.id}/editar`} size="small">
                      Editar
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => onRemove(row.id, row.nome)}
                      disabled={removeMutation.isPending}
                      sx={{ ml: 1 }}
                    >
                      Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
