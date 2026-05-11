import { Controller, useForm } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
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
} from '@mui/material'
import type { CategoryOption } from '@/features/categories/useCategoryOptions'
import { eventFormSchema } from '@/features/events/eventFormSchema'
import type { EventFormValues } from '@/features/events/types'
import type { Company } from '@/features/companies/types'

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
  const {
    control,
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    defaultValues,
    resolver: zodResolver(eventFormSchema) as Resolver<EventFormValues>,
  })

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={2} sx={{ maxWidth: 720 }}>
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
