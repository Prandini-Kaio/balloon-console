import { useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
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
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { PageHeader } from '@/shared/ui/PageHeader'
import { EmptyState } from '@/shared/ui/EmptyState'
import { formatDateTimePt } from '@/shared/lib/dateFormat'
import { useEventsPageQuery } from '@/features/events/hooks/useEventsPageQuery'
import { useDeleteEventMutation } from '@/features/events/hooks/useEventMutations'
import type { EventoListFilter, StatusEvento } from '@/features/events/types'

const defaultSize = 10

export function EventsListPage() {
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(defaultSize)
  const [nome, setNome] = useState('')
  const [status, setStatus] = useState<StatusEvento | ''>('')
  const [applied, setApplied] = useState<EventoListFilter>({})

  const filter = useMemo<EventoListFilter>(() => {
    const f: EventoListFilter = {}
    if (applied.nome) f.nome = applied.nome
    if (applied.status) f.status = applied.status
    return f
  }, [applied])

  const query = useEventsPageQuery(filter, page, size)
  const deleteMutation = useDeleteEventMutation()

  function applyFilters() {
    setApplied({
      nome: nome.trim() || undefined,
      status: status || undefined,
    })
    setPage(0)
  }

  async function onDelete(id: number, nomeEvento: string) {
    if (!window.confirm(`Excluir o evento "${nomeEvento}"?`)) return
    try {
      await deleteMutation.mutateAsync(id)
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Erro ao excluir')
    }
  }

  return (
    <Box>
      <PageHeader
        title="Eventos"
        subtitle="Cadastro e gestão de eventos exibidos no app"
        actions={
          <Button component={RouterLink} to="/admin/eventos/novo" variant="contained">
            Novo evento
          </Button>
        }
      />
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ alignItems: { sm: 'center' } }}
        >
          <TextField
            label="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            size="small"
          />
          <TextField
            select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusEvento | '')}
            size="small"
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="ATIVO">Ativo</MenuItem>
            <MenuItem value="INATIVO">Inativo</MenuItem>
            <MenuItem value="CANCELADO">Cancelado</MenuItem>
            <MenuItem value="FINALIZADO">Finalizado</MenuItem>
          </TextField>
          <Button variant="outlined" onClick={applyFilters}>
            Aplicar filtros
          </Button>
        </Stack>
      </Paper>
      {query.isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : query.isError ? (
        <Alert severity="error">{query.error.message}</Alert>
      ) : !query.data?.content.length ? (
        <EmptyState title="Nenhum evento encontrado" description="Ajuste os filtros ou cadastre um novo evento." />
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Categoria</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Início</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {query.data.content.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.nome}</TableCell>
                    <TableCell>{row.categoria}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell>{formatDateTimePt(row.dataInicio)}</TableCell>
                    <TableCell align="right">
                      <Button component={RouterLink} to={`/admin/eventos/${row.id}/editar`} size="small">
                        Editar
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => onDelete(row.id, row.nome)}
                        disabled={deleteMutation.isPending}
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
          <TablePagination
            component="div"
            count={query.data.totalElements}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={size}
            onRowsPerPageChange={(e) => {
              setSize(parseInt(e.target.value, 10))
              setPage(0)
            }}
            rowsPerPageOptions={[5, 10, 20, 50]}
            labelRowsPerPage="Linhas"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </>
      )}
      {deleteMutation.isError ? (
        <Typography variant="caption" color="error">
          {(deleteMutation.error as Error).message}
        </Typography>
      ) : null}
    </Box>
  )
}
