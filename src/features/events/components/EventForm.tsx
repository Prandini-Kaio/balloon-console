import { Controller, useForm } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import type { CategoryOption } from '@/features/categories/types'
import { eventFormSchema } from '@/features/events/eventFormSchema'
import type { EventFormValues } from '@/features/events/types'
import type { Company } from '@/features/companies/types'
import { presignEventoCapa, putCapaToR2 } from '@/features/events/eventMedia.api'
import { isApiFailure } from '@/core/api/types'

type EventFormProps = {
  defaultValues: EventFormValues
  categoryOptions: CategoryOption[]
  companies: Company[]
  onSubmit: (values: EventFormValues) => void | Promise<void>
  onCancel?: () => void
  submitLabel: string
}

export function EventForm({
  defaultValues,
  categoryOptions,
  companies,
  onSubmit,
  onCancel,
  submitLabel,
}: EventFormProps) {
  const [capaFile, setCapaFile] = useState<File | null>(null)
  const [capaPreview, setCapaPreview] = useState<string | null>(null)
  const [uploadErr, setUploadErr] = useState<string | null>(null)
  const capaInputRef = useRef<HTMLInputElement>(null)

  const {
    control,
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    defaultValues,
    values: defaultValues,
    resolver: zodResolver(eventFormSchema) as Resolver<EventFormValues>,
  })

  const imagemCapaUrl = watch('imagemCapaUrl')

  useEffect(() => {
    return () => {
      if (capaPreview?.startsWith('blob:')) URL.revokeObjectURL(capaPreview)
    }
  }, [capaPreview])

  useEffect(() => {
    setCapaFile(null)
    setCapaPreview(null)
    setUploadErr(null)
  }, [defaultValues])

  function onPickCapa(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (!f.type.startsWith('image/')) {
      setUploadErr('Selecione um arquivo de imagem.')
      return
    }
    setCapaFile(f)
    setCapaPreview(URL.createObjectURL(f))
    setUploadErr(null)
  }

  function clearCapa() {
    setCapaFile(null)
    setCapaPreview((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
      return null
    })
    setValue('imagemCapaUrl', '')
    setUploadErr(null)
  }

  async function onValid(values: EventFormValues) {
    setUploadErr(null)
    try {
      let nextCapa = values.imagemCapaUrl?.trim() ?? ''
      if (capaFile) {
        const pr = await presignEventoCapa(capaFile.type, capaFile.name)
        if (isApiFailure(pr)) {
          setUploadErr(pr.message)
          return
        }
        await putCapaToR2(pr.data.uploadUrl, capaFile, pr.data.contentType)
        nextCapa = pr.data.publicUrl
        setValue('imagemCapaUrl', nextCapa)
      }
      await onSubmit({ ...values, imagemCapaUrl: nextCapa })
    } catch (err) {
      setUploadErr(err instanceof Error ? err.message : 'Erro no upload')
    }
  }

  const previewSrc = capaPreview || (imagemCapaUrl?.trim() ? imagemCapaUrl.trim() : '')

  return (
    <Box component="form" onSubmit={handleSubmit(onValid)} noValidate>
      <Stack spacing={2} sx={{ maxWidth: 720 }}>
        <input type="hidden" {...register('imagemCapaUrl')} />
        <TextField
          label="Nome"
          {...register('nome')}
          error={!!errors.nome}
          helperText={errors.nome?.message}
          required
          fullWidth
        />
        <TextField
          label="Descrição"
          {...register('descricao')}
          error={!!errors.descricao}
          helperText={errors.descricao?.message}
          required
          fullWidth
          multiline
          minRows={3}
        />
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Capa do evento (opcional)
          </Typography>
          {uploadErr ? (
            <Alert severity="error" sx={{ mb: 1 }}>
              {uploadErr}
            </Alert>
          ) : null}
          {previewSrc ? (
            <Box
              component="img"
              src={previewSrc}
              alt="Pré-visualização da capa"
              sx={{ maxWidth: '100%', maxHeight: 220, borderRadius: 1, display: 'block', mb: 1 }}
            />
          ) : null}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button type="button" variant="outlined" size="small" onClick={() => capaInputRef.current?.click()}>
              Escolher imagem
            </Button>
            {previewSrc ? (
              <Button type="button" variant="text" size="small" color="inherit" onClick={clearCapa}>
                Remover capa
              </Button>
            ) : null}
          </Stack>
          <input
            ref={capaInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={onPickCapa}
          />
          <FormHelperText>JPEG, PNG ou WebP. Upload direto ao R2 quando o servidor estiver configurado.</FormHelperText>
        </Box>
        {categoryOptions.length > 0 ? (
          <Controller
            name="categoriaId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.categoriaId}>
                <InputLabel id="categoria-label">Categoria</InputLabel>
                <Select
                  labelId="categoria-label"
                  label="Categoria"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                >
                  {categoryOptions.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.nome}
                    </MenuItem>
                  ))}
                </Select>
                {errors.categoriaId ? (
                  <FormHelperText>{errors.categoriaId.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />
        ) : (
          <TextField
            label="ID da categoria"
            type="number"
            {...register('categoriaId', { valueAsNumber: true })}
            error={!!errors.categoriaId}
            helperText={
              errors.categoriaId?.message ??
              'Defina VITE_CATEGORIES_JSON no ambiente para lista guiada.'
            }
            fullWidth
            required
          />
        )}
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                label="Status"
                value={field.value ?? ''}
                onChange={(e) => {
                  const v = e.target.value as string
                  field.onChange(v === '' ? undefined : v)
                }}
              >
                <MenuItem value="">
                  <em>Padrão do servidor</em>
                </MenuItem>
                <MenuItem value="ATIVO">ATIVO</MenuItem>
                <MenuItem value="INATIVO">INATIVO</MenuItem>
                <MenuItem value="CANCELADO">CANCELADO</MenuItem>
                <MenuItem value="FINALIZADO">FINALIZADO</MenuItem>
              </Select>
            </FormControl>
          )}
        />
        <Controller
          name="tipoEvento"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.tipoEvento}>
              <InputLabel id="tipo-label">Tipo do evento</InputLabel>
              <Select
                labelId="tipo-label"
                label="Tipo do evento"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
              >
                <MenuItem value="CULTURAL">Cultural</MenuItem>
                <MenuItem value="BUSINESS">Business</MenuItem>
                <MenuItem value="CONCERTO">Concerto</MenuItem>
                <MenuItem value="ESPORTIVO">Esportivo</MenuItem>
                <MenuItem value="FESTIVAL">Festival</MenuItem>
                <MenuItem value="SOCIAL">Social</MenuItem>
                <MenuItem value="GASTRONOMICO">Gastronômico</MenuItem>
                <MenuItem value="EDUCACIONAL">Educacional</MenuItem>
                <MenuItem value="OUTROS">Outros</MenuItem>
              </Select>
              {errors.tipoEvento ? (
                <FormHelperText>{errors.tipoEvento.message}</FormHelperText>
              ) : null}
            </FormControl>
          )}
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Latitude"
            type="number"
            {...register('latitude', { valueAsNumber: true })}
            error={!!errors.latitude}
            helperText={errors.latitude?.message}
            fullWidth
            required
            slotProps={{ htmlInput: { step: 'any' } }}
          />
          <TextField
            label="Longitude"
            type="number"
            {...register('longitude', { valueAsNumber: true })}
            error={!!errors.longitude}
            helperText={errors.longitude?.message}
            fullWidth
            required
            slotProps={{ htmlInput: { step: 'any' } }}
          />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Início"
            type="datetime-local"
            {...register('dataInicio')}
            error={!!errors.dataInicio}
            helperText={errors.dataInicio?.message}
            fullWidth
            required
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Fim"
            type="datetime-local"
            {...register('dataFim')}
            error={!!errors.dataFim}
            helperText={errors.dataFim?.message}
            fullWidth
            required
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Stack>
        <Controller
          name="ativo"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Checkbox checked={field.value} onChange={(_, v) => field.onChange(v)} />}
              label="Evento ativo (publicado)"
            />
          )}
        />
        <Controller
          name="companyId"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel id="company-label">Empresa (referência interna)</InputLabel>
              <Select
                labelId="company-label"
                label="Empresa (referência interna)"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
              >
                <MenuItem value="">
                  <em>Nenhuma</em>
                </MenuItem>
                {companies.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Campo preparado para vínculo futuro com a API; não é enviado ao backend.
              </FormHelperText>
            </FormControl>
          )}
        />
        <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando…' : submitLabel}
          </Button>
          {onCancel ? (
            <Button type="button" variant="outlined" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
          ) : null}
        </Stack>
      </Stack>
    </Box>
  )
}
