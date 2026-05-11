import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Alert, Box } from '@mui/material'
import { PageHeader } from '@/shared/ui/PageHeader'
import { EventForm } from '@/features/events/components/EventForm'
import { useCategoryOptions } from '@/features/categories/useCategoryOptions'
import { listCompanies } from '@/features/companies/companies.api'
import { formValuesToEventoInput } from '@/features/events/eventMappers'
import { useCreateEventMutation } from '@/features/events/hooks/useEventMutations'
import type { EventFormValues } from '@/features/events/types'

export function EventNewPage() {
  const navigate = useNavigate()
  const categoryOptions = useCategoryOptions()
  const companiesQuery = useQuery({ queryKey: ['companies'], queryFn: listCompanies })
  const createMutation = useCreateEventMutation()

  const defaultValues: EventFormValues = {
    nome: '',
    descricao: '',
    categoriaId: categoryOptions[0]?.id ?? 0,
    status: undefined,
    tipoEvento: 'SOCIAL',
    latitude: -23.55052,
    longitude: -46.633308,
    dataInicio: '',
    dataFim: '',
    ativo: true,
    companyId: '',
  }

  async function onSubmit(values: EventFormValues) {
    try {
      await createMutation.mutateAsync(formValuesToEventoInput(values))
      navigate('/admin/eventos')
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Erro ao criar')
    }
  }

  return (
    <Box>
      <PageHeader title="Novo evento" />
      {companiesQuery.isError ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {(companiesQuery.error as Error).message}
        </Alert>
      ) : null}
      <EventForm
        key={`new-${categoryOptions.map((c) => c.id).join(',')}`}
        defaultValues={defaultValues}
        categoryOptions={categoryOptions}
        companies={companiesQuery.data ?? []}
        onSubmit={onSubmit}
        onCancel={() => navigate('/admin/eventos')}
        submitLabel="Criar evento"
      />
    </Box>
  )
}
