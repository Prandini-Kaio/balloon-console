import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  FormControlLabel,
} from '@mui/material'
import { PageHeader } from '@/shared/ui/PageHeader'
import { isApiFailure } from '@/core/api/types'
import { RegiaoMapPicker, type RegiaoMapValue } from '@/features/appDestaque/components/RegiaoMapPicker'
import {
  createRegiaoDestaque,
  deleteRegiaoDestaque,
  listRegioesDestaque,
  updateRegiaoDestaque,
  type RegiaoDestaque,
  type RegiaoDestaqueInput,
} from '@/features/appDestaque/regioes.api'

function emptyForm(): RegiaoMapValue & { ativo: boolean } {
  return {
    nome: '',
    cidade: '',
    estado: 'PR',
    latitude: -23.55052,
    longitude: -46.633308,
    raioKm: 15,
    ativo: true,
  }
}

function toInput(form: RegiaoMapValue & { ativo: boolean }): RegiaoDestaqueInput {
  return {
    nome: form.nome.trim(),
    cidade: form.cidade.trim(),
    estado: form.estado.trim(),
    latitude: form.latitude,
    longitude: form.longitude,
    raioKm: form.raioKm,
    ativo: form.ativo,
  }
}

function formatLocal(row: RegiaoDestaque): string {
  if (row.cidade && row.estado) return `${row.cidade} / ${row.estado}`
  return '—'
}

export function RegioesDestaquePage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<RegiaoDestaque | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [error, setError] = useState<string | null>(null)

  const query = useQuery({
    queryKey: ['regioes-destaque'],
    queryFn: async () => {
      const res = await listRegioesDestaque()
      if (isApiFailure(res)) throw new Error(res.message)
      return res.data
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = toInput(form)
      if (!body.nome || !body.cidade || !body.estado) {
        throw new Error('Preencha nome, cidade e UF.')
      }
      const res = editing
        ? await updateRegiaoDestaque(editing.id, body)
        : await createRegiaoDestaque(body)
      if (isApiFailure(res)) throw new Error(res.message)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['regioes-destaque'] })
      setOpen(false)
      setEditing(null)
      setForm(emptyForm())
    },
    onError: (e: Error) => setError(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await deleteRegiaoDestaque(id)
      if (isApiFailure(res)) throw new Error(res.message)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['regioes-destaque'] }),
  })

  function openCreate() {
    setEditing(null)
    setForm(emptyForm())
    setError(null)
    setOpen(true)
  }

  function openEdit(row: RegiaoDestaque) {
    setEditing(row)
    setForm({
      nome: row.nome,
      cidade: row.cidade ?? '',
      estado: row.estado ?? 'PR',
      latitude: row.latitude,
      longitude: row.longitude,
      raioKm: row.raioKm,
      ativo: row.ativo,
    })
    setError(null)
    setOpen(true)
  }

  return (
    <Box>
      <PageHeader
        title="Regiões de destaque"
        subtitle="Áreas geográficas (cidade/UF + raio no mapa) onde o app pode exibir imagens promocionais."
        actions={
          <Button variant="contained" onClick={openCreate}>
            Nova região
          </Button>
        }
      />
      {query.isError ? <Alert severity="error">{String(query.error)}</Alert> : null}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Cidade / UF</TableCell>
            <TableCell>Raio (km)</TableCell>
            <TableCell>Ativa</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(query.data ?? []).map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.nome}</TableCell>
              <TableCell>{formatLocal(row)}</TableCell>
              <TableCell>{row.raioKm}</TableCell>
              <TableCell>{row.ativo ? 'Sim' : 'Não'}</TableCell>
              <TableCell align="right">
                <Button size="small" onClick={() => openEdit(row)}>
                  Editar
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => {
                    if (window.confirm('Desativar esta região?')) deleteMutation.mutate(row.id)
                  }}
                >
                  Desativar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editing ? 'Editar região' : 'Nova região'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <RegiaoMapPicker
              value={form}
              onChange={(next) => setForm({ ...next, ativo: form.ativo })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.ativo}
                  onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
                />
              }
              label="Região ativa"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
