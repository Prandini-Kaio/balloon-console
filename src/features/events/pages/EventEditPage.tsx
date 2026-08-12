import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Box, CircularProgress } from '@mui/material'
import { PageHeader } from '@/shared/ui/PageHeader'
import { EventForm } from '@/features/events/components/EventForm'
import { useCategoriesQuery } from '@/features/categories/useCategoriesQuery'
import { listCompanies } from '@/features/companies/companies.api'
import {
  eventoOutputToFormValues,
  formValuesToEventoInput,
  resolveCategoriaIdsFromNames,
} from '@/features/events/eventMappers'
import { fetchEventoById } from '@/features/events/events.api'
import { isApiFailure } from '@/core/api/types'
import type { EventFormValues } from '@/features/events/types'
import { useUpdateEventMutation } from '@/features/events/hooks/useEventMutations'
import { useAuth } from '@/core/auth/AuthContext'
import { isSuperAdmin } from '@/core/auth/mapUser'

export function EventEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const eventId = Number(id)
  const catQuery = useCategoriesQuery()
  const categoryOptions = useMemo(() => catQuery.data ?? [], [catQuery.data])
  const showCompanyField = isSuperAdmin(user)
  const companiesQuery = useQuery({
    queryKey: ['companies'],
    queryFn: listCompanies,
    enabled: showCompanyField,
  })
  const eventQuery = useQuery({
    queryKey: ['event', eventId],
    enabled: Number.isFinite(eventId) && eventId > 0,
    queryFn: async () => {
      const res = await fetchEventoById(eventId)
      if (isApiFailure(res)) throw new Error(res.message)
      return res.data
    },
  })
  const updateMutation = useUpdateEventMutation()

  const defaultValues = useMemo(() => {
    if (!eventQuery.data) return null
    const catIds = resolveCategoriaIdsFromNames(eventQuery.data.categorias ?? [], categoryOptions)
    return eventoOutputToFormValues(eventQuery.data, '', catIds)
  }, [eventQuery.data, categoryOptions])

  async function onSubmit(values: EventFormValues) {
    if (!Number.isFinite(eventId) || eventId <= 0) return
    try {
      await updateMutation.mutateAsync({ id: eventId, body: formValuesToEventoInput(values) })
      navigate('/admin/eventos')
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Erro ao salvar')
    }
  }

  if (!Number.isFinite(eventId) || eventId <= 0) {
    return <Alert severity="error">Identificador inválido</Alert>
  }

  const pageLoading = eventQuery.isLoading || catQuery.isLoading

  return (
    <Box>
      <PageHeader title="Editar evento" />
      {catQuery.isError ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Não foi possível carregar categorias da API: {(catQuery.error as Error).message}
        </Alert>
      ) : null}
      {companiesQuery.isError ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {(companiesQuery.error as Error).message}
        </Alert>
      ) : null}
      {pageLoading || !defaultValues ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : eventQuery.isError ? (
        <Alert severity="error">{(eventQuery.error as Error).message}</Alert>
      ) : (
        <EventForm
          key={String(eventId)}
          defaultValues={defaultValues}
          categoryOptions={categoryOptions}
          companies={companiesQuery.data ?? []}
          showCompanyField={showCompanyField}
          eventoId={eventId}
          onSubmit={onSubmit}
          onCancel={() => navigate('/admin/eventos')}
          submitLabel="Salvar alterações"
        />
      )}
    </Box>
  )
}
