import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
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
import { EmptyState } from '@/shared/ui/EmptyState'
import { createAdmin, listAdmins, updateAdmin } from '@/features/admins/admins.api'
import type { AdminConta } from '@/features/admins/types'
import {
  ADMIN_PERMISSOES,
  ADMIN_PERMISSAO_LABELS,
  type AdminPermissao,
} from '@/core/auth/types'
import { useAuth } from '@/core/auth/AuthContext'

function PermissoesEditor({
  value,
  onChange,
  disabled,
}: {
  value: AdminPermissao[]
  onChange: (next: AdminPermissao[]) => void
  disabled?: boolean
}) {
  function toggle(code: AdminPermissao) {
    if (value.includes(code)) onChange(value.filter((p) => p !== code))
    else onChange([...value, code])
  }

  return (
    <FormGroup>
      {ADMIN_PERMISSOES.map((code) => (
        <FormControlLabel
          key={code}
          control={
            <Checkbox
              size="small"
              checked={value.includes(code)}
              onChange={() => toggle(code)}
              disabled={disabled}
            />
          }
          label={ADMIN_PERMISSAO_LABELS[code]}
        />
      ))}
    </FormGroup>
  )
}

const emptyCreate = {
  nome: '',
  email: '',
  senha: '',
  permissoes: [...ADMIN_PERMISSOES] as AdminPermissao[],
}

export function AdminsPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const query = useQuery({ queryKey: ['admins'], queryFn: listAdmins })

  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState(emptyCreate)

  const [editTarget, setEditTarget] = useState<AdminConta | null>(null)
  const [editNome, setEditNome] = useState('')
  const [editSenha, setEditSenha] = useState('')
  const [editPermissoes, setEditPermissoes] = useState<AdminPermissao[]>([])

  const createMutation = useMutation({
    mutationFn: createAdmin,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admins'] })
      setCreateOpen(false)
      setCreateForm(emptyCreate)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Parameters<typeof updateAdmin>[1] }) =>
      updateAdmin(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admins'] })
      setEditTarget(null)
    },
  })

  const editingSelf = useMemo(
    () => editTarget != null && String(editTarget.id) === user?.id,
    [editTarget, user?.id],
  )

  function openEdit(admin: AdminConta) {
    setEditTarget(admin)
    setEditNome(admin.nome)
    setEditSenha('')
    setEditPermissoes([...(admin.permissoes ?? [])])
  }

  async function onToggleAtivo(admin: AdminConta) {
    const next = !admin.ativo
    const label = next ? 'ativar' : 'desativar'
    if (!window.confirm(`Confirma ${label} ${admin.nome}?`)) return
    try {
      await updateMutation.mutateAsync({ id: admin.id, body: { ativo: next } })
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Erro ao atualizar')
    }
  }

  return (
    <Box>
      <PageHeader
        title="Administradores"
        subtitle="Contas internas do Balloon Console e o que cada uma pode fazer"
        actions={
          <Button
            variant="contained"
            onClick={() => {
              setCreateForm(emptyCreate)
              setCreateOpen(true)
            }}
          >
            Novo admin
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
        <EmptyState title="Nenhum administrador cadastrado" />
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>E-mail</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Permissões</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {query.data.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.nome}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={row.ativo ? 'Ativo' : 'Inativo'}
                      color={row.ativo ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" flexWrap="wrap" gap={0.5} useFlexGap>
                      {(row.permissoes ?? []).map((p) => (
                        <Chip key={p} size="small" label={ADMIN_PERMISSAO_LABELS[p] ?? p} variant="outlined" />
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => openEdit(row)}>
                      Editar
                    </Button>
                    <Button size="small" onClick={() => void onToggleAtivo(row)}>
                      {row.ativo ? 'Desativar' : 'Ativar'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Novo administrador</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nome"
              value={createForm.nome}
              onChange={(e) => setCreateForm((f) => ({ ...f, nome: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="E-mail"
              type="email"
              value={createForm.email}
              onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Senha"
              type="password"
              value={createForm.senha}
              onChange={(e) => setCreateForm((f) => ({ ...f, senha: e.target.value }))}
              fullWidth
              required
            />
            <Typography variant="subtitle2">Permissões</Typography>
            <PermissoesEditor
              value={createForm.permissoes}
              onChange={(permissoes) => setCreateForm((f) => ({ ...f, permissoes }))}
            />
            {createMutation.isError ? (
              <Alert severity="error">{(createMutation.error as Error).message}</Alert>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={createMutation.isPending}
            onClick={() => {
              void createMutation.mutateAsync(createForm).catch(() => undefined)
            }}
          >
            Criar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editTarget != null} onClose={() => setEditTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle>Editar administrador</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nome"
              value={editNome}
              onChange={(e) => setEditNome(e.target.value)}
              fullWidth
            />
            <TextField
              label="Nova senha (opcional)"
              type="password"
              value={editSenha}
              onChange={(e) => setEditSenha(e.target.value)}
              fullWidth
            />
            <Typography variant="subtitle2">Permissões</Typography>
            <PermissoesEditor value={editPermissoes} onChange={setEditPermissoes} />
            {editingSelf ? (
              <Alert severity="info">Você não pode remover a própria permissão de gerir administradores.</Alert>
            ) : null}
            {updateMutation.isError ? (
              <Alert severity="error">{(updateMutation.error as Error).message}</Alert>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTarget(null)}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={updateMutation.isPending || !editTarget}
            onClick={() => {
              if (!editTarget) return
              void updateMutation
                .mutateAsync({
                  id: editTarget.id,
                  body: {
                    nome: editNome,
                    permissoes: editPermissoes,
                    ...(editSenha.trim() ? { novaSenha: editSenha.trim() } : {}),
                  },
                })
                .catch(() => undefined)
            }}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
