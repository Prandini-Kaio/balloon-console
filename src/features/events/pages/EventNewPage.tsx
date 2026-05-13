import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Alert, Box, CircularProgress } from '@mui/material'
import { PageHeader } from '@/shared/ui/PageHeader'
import { EventForm } from '@/features/events/components/EventForm'
import { EventJsonImporter } from '@/features/events/components/EventJsonImporter'
import { useCategoriesQuery } from '@/features/categories/useCategoriesQuery'
import { listCompanies } from '@/features/companies/companies.api'
import { formValuesToEventoInput } from '@/features/events/eventMappers'
import { useCreateEventMutation } from '@/features/events/hooks/useEventMutations'
import type { EventFormValues } from '@/features/events/types'

export function EventNewPage() {
  const navigate = useNavigate()
  const catQuery = useCategoriesQuery()
  const categoryOptions = useMemo(() => catQuery.data ?? [], [catQuery.data])
  const [importPatch, setImportPatch] = useState<Partial<EventFormValues>>({})
  const [formNonce, setFormNonce] = useState(0)

  const companiesQuery = useQuery({ queryKey: ['companies'], queryFn: listCompanies })
  const createMutation = useCreateEventMutation()

  function handleImportApply(patch: Partial<EventFormValues>) {
    setImportPatch((prev) => ({ ...prev, ...patch }))
    setFormNonce((n) => n + 1)
  }

  const defaultValues = useMemo((): EventFormValues => {
    const base: EventFormValues = {
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
      imagemCapaUrl: '',
    }
    return { ...base, ...importPatch }
  }, [categoryOptions, importPatch])

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
      {catQuery.isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <EventJsonImporter onApply={handleImportApply} />
          <EventForm
            key={`new-${categoryOptions.map((c) => c.id).join('-')}-${formNonce}`}
            defaultValues={defaultValues}
            categoryOptions={categoryOptions}
            companies={companiesQuery.data ?? []}
            onSubmit={onSubmit}
            onCancel={() => navigate('/admin/eventos')}
            submitLabel="Criar evento"
          />
        </>
      )}
    </Box>
  )
}
