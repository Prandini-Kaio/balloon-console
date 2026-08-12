import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { PageHeader } from '@/shared/ui/PageHeader'
import { isApiFailure } from '@/core/api/types'
import { listCompanies } from '@/features/companies/companies.api'
import { putCapaToR2 } from '@/features/events/eventMedia.api'
import {
  createCampanhaDestaque,
  deleteCampanhaDestaque,
  listCampanhasDestaque,
  presignCampanhaDestaque,
  updateCampanhaDestaque,
  type DestaqueCampanha,
  type DestaqueCampanhaInput,
  type DestaqueCampanhaStatus,
} from '@/features/appDestaque/campanhas.api'
import { listRegioesDestaque } from '@/features/appDestaque/regioes.api'

const STATUS_LABEL: Record<DestaqueCampanhaStatus, string> = {
  PENDENTE: 'Aguardando',
  ATIVA: 'Exibindo no app',
  VENCIDA: 'Encerrada',
  CANCELADA: 'Cancelada',
}

type FormState = {
  id?: number
  empresaId: number
  regiaoId: number
  dataInicio: string
  dataFim: string
  status: DestaqueCampanhaStatus
  imageUrl: string
  storageKey: string
}

function emptyForm(): FormState {
  const today = new Date().toISOString().slice(0, 10)
  return {
    empresaId: 0,
    regiaoId: 0,
    dataInicio: today,
    dataFim: today,
    status: 'ATIVA',
    imageUrl: '',
    storageKey: '',
  }
}

function regiaoLabel(r: { nome: string; cidade?: string | null; estado?: string | null }) {
  if (r.cidade && r.estado) return `${r.nome} (${r.cidade}/${r.estado})`
  return r.nome
}

export function CampanhasDestaquePage() {
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const campanhasQuery = useQuery({
    queryKey: ['campanhas-destaque'],
    queryFn: async () => {
      const res = await listCampanhasDestaque()
      if (isApiFailure(res)) throw new Error(res.message)
      return res.data
    },
  })

  const regioesQuery = useQuery({
    queryKey: ['regioes-destaque', 'ativas'],
    queryFn: async () => {
      const res = await listRegioesDestaque(true)
      if (isApiFailure(res)) throw new Error(res.message)
      return res.data
    },
  })

  const companiesQuery = useQuery({
    queryKey: ['companies'],
    queryFn: listCompanies,
  })

  const grouped = useMemo(() => {
    const map = new Map<string, DestaqueCampanha[]>()
    for (const c of campanhasQuery.data ?? []) {
      const key = c.regiaoNome
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(c)
    }
    return map
  }, [campanhasQuery.data])

  async function saveCampanha() {
    setError(null)
    if (!form.empresaId || !form.regiaoId) {
      throw new Error('Selecione empresa e região.')
    }
    if (!form.dataInicio || !form.dataFim) {
      throw new Error('Informe o período de exibição.')
    }
    if (!form.id && !imageFile && !form.imageUrl) {
      throw new Error('Selecione a imagem de destaque.')
    }

    const body: DestaqueCampanhaInput = {
      empresaId: form.empresaId,
      regiaoId: form.regiaoId,
      dataInicio: form.dataInicio,
      dataFim: form.dataFim,
      status: form.status,
      imageUrl: form.imageUrl || null,
      storageKey: form.storageKey || null,
    }

    let campanha: DestaqueCampanha
    if (form.id) {
      const res = await updateCampanhaDestaque(form.id, body)
      if (isApiFailure(res)) throw new Error(res.message)
      campanha = res.data
    } else {
      const res = await createCampanhaDestaque(body)
      if (isApiFailure(res)) throw new Error(res.message)
      campanha = res.data
    }

    if (imageFile) {
      const pr = await presignCampanhaDestaque(campanha.id, imageFile.type)
      if (isApiFailure(pr)) throw new Error(pr.message)
      await putCapaToR2(pr.data.uploadUrl, imageFile, pr.data.contentType)
      const upd = await updateCampanhaDestaque(campanha.id, {
        ...body,
        imageUrl: pr.data.publicUrl,
        storageKey: pr.data.key,
      })
      if (isApiFailure(upd)) throw new Error(upd.message)
    }
  }

  const saveMutation = useMutation({
    mutationFn: saveCampanha,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campanhas-destaque'] })
      setOpen(false)
      setForm(emptyForm())
      setImageFile(null)
    },
    onError: (e: Error) => setError(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await deleteCampanhaDestaque(id)
      if (isApiFailure(res)) throw new Error(res.message)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campanhas-destaque'] }),
  })

  function openCreate() {
    const firstEmpresa = companiesQuery.data?.[0]?.id ?? 0
    const firstRegiao = regioesQuery.data?.[0]?.id ?? 0
    setForm({ ...emptyForm(), empresaId: firstEmpresa, regiaoId: firstRegiao })
    setImageFile(null)
    setError(null)
    setOpen(true)
  }

  function openEdit(row: DestaqueCampanha) {
    setForm({
      id: row.id,
      empresaId: row.empresaId,
      regiaoId: row.regiaoId,
      dataInicio: row.dataInicio,
      dataFim: row.dataFim,
      status: row.status,
      imageUrl: row.imageUrl ?? '',
      storageKey: row.storageKey ?? '',
    })
    setImageFile(null)
    setError(null)
    setOpen(true)
  }

  function onPickImage(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (f) setImageFile(f)
  }

  const previewSrc = useMemo(() => {
    if (imageFile) return URL.createObjectURL(imageFile)
    return form.imageUrl || ''
  }, [imageFile, form.imageUrl])

  useEffect(() => {
    return () => {
      if (previewSrc.startsWith('blob:')) URL.revokeObjectURL(previewSrc)
    }
  }, [previewSrc])

  return (
    <Box>
      <PageHeader
        title="Destaques no app"
        subtitle="Imagens exibidas na abertura do mobile para usuários dentro da região e no período definidos."
        actions={
          <Button variant="contained" onClick={openCreate}>
            Novo destaque
          </Button>
        }
      />
      {campanhasQuery.isError ? <Alert severity="error">{String(campanhasQuery.error)}</Alert> : null}
      {[...grouped.entries()].map(([regiaoNome, items]) => (
        <Box key={regiaoNome} sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {regiaoNome}
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Empresa</TableCell>
                <TableCell>Período</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Imagem</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.empresaNome}</TableCell>
                  <TableCell>
                    {row.dataInicio} — {row.dataFim}
                  </TableCell>
                  <TableCell>{STATUS_LABEL[row.status]}</TableCell>
                  <TableCell>
                    {row.imageUrl ? (
                      <Box
                        component="img"
                        src={row.imageUrl}
                        alt=""
                        sx={{ height: 40, maxWidth: 80, objectFit: 'cover', borderRadius: 0.5 }}
                      />
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => openEdit(row)}>
                      Editar
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => {
                        if (window.confirm('Excluir destaque e imagem?')) deleteMutation.mutate(row.id)
                      }}
                    >
                      Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      ))}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{form.id ? 'Editar destaque' : 'Novo destaque no app'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <FormControl fullWidth required>
              <InputLabel>Empresa</InputLabel>
              <Select
                label="Empresa"
                value={form.empresaId || ''}
                onChange={(e) => setForm({ ...form, empresaId: Number(e.target.value) })}
              >
                {(companiesQuery.data ?? []).map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Região</InputLabel>
              <Select
                label="Região"
                value={form.regiaoId || ''}
                onChange={(e) => setForm({ ...form, regiaoId: Number(e.target.value) })}
              >
                {(regioesQuery.data ?? []).map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {regiaoLabel(r)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Exibir a partir de"
              type="date"
              value={form.dataInicio}
              onChange={(e) => setForm({ ...form, dataInicio: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
              required
            />
            <TextField
              label="Exibir até"
              type="date"
              value={form.dataFim}
              onChange={(e) => setForm({ ...form, dataFim: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as DestaqueCampanhaStatus })}
              >
                {(Object.keys(STATUS_LABEL) as DestaqueCampanhaStatus[]).map((s) => (
                  <MenuItem key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary">
              Exibida no diálogo de abertura do app (região do usuário). Use proporção 1:1 —
              recomendado 1080×1080 px (mín. 720×720). A imagem preenche a área com corte
              (cover); evite texto importante nas bordas.
            </Typography>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={onPickImage} />
            <Button variant="outlined" onClick={() => fileRef.current?.click()}>
              {imageFile ? imageFile.name : 'Selecionar imagem (1080×1080)'}
            </Button>
            {previewSrc ? (
              <Box
                component="img"
                src={previewSrc}
                alt="Pré-visualização"
                sx={{ maxHeight: 160, objectFit: 'contain', borderRadius: 1 }}
              />
            ) : null}
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
