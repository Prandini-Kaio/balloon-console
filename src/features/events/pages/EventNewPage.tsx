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
import { presignEventoCapa, putCapaToR2 } from '@/features/events/eventMedia.api'
import { useCreateEventMutation, useUpdateEventMutation } from '@/features/events/hooks/useEventMutations'
import { isApiFailure } from '@/core/api/types'
import type { EventFormValues } from '@/features/events/types'
import { useAuth } from '@/core/auth/AuthContext'
import { isSuperAdmin } from '@/core/auth/mapUser'

export function EventNewPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const catQuery = useCategoriesQuery()
  const categoryOptions = useMemo(() => catQuery.data ?? [], [catQuery.data])
  const showCompanyField = isSuperAdmin(user)
  const [importPatch, setImportPatch] = useState<Partial<EventFormValues>>({})
  const [formNonce, setFormNonce] = useState(0)

  const companiesQuery = useQuery({
    queryKey: ['companies'],
    queryFn: listCompanies,
    enabled: showCompanyField,
  })
  const createMutation = useCreateEventMutation()
  const updateMutation = useUpdateEventMutation()

  function handleImportApply(patch: Partial<EventFormValues>) {
    setImportPatch((prev) => ({ ...prev, ...patch }))
    setFormNonce((n) => n + 1)
  }

  const defaultValues = useMemo((): EventFormValues => {
    const base: EventFormValues = {
      nome: '',
      descricao: '',
      categoriaIds: categoryOptions[0] != null ? [categoryOptions[0].id] : [],
      status: undefined,
      tipoEvento: 'SOCIAL',
      latitude: -23.55052,
      longitude: -46.633308,
      dataInicio: '',
      dataFim: '',
      ativo: true,
      companyId: user?.empresaId != null ? String(user.empresaId) : '',
      imagemCapaUrl: '',
      storageKeyCapa: '',
      whatsappContato: '',
      siteUrl: '',
    }
    return { ...base, ...importPatch }
  }, [categoryOptions, importPatch, user?.empresaId])

  async function onSubmit(values: EventFormValues, capaFile?: File | null) {
    try {
      const body = formValuesToEventoInput({
        ...values,
        imagemCapaUrl: '',
        storageKeyCapa: '',
      })
      const created = await createMutation.mutateAsync(body)
      let nextValues = values
      if (capaFile) {
        const pr = await presignEventoCapa(created.id, capaFile.type)
        if (isApiFailure(pr)) throw new Error(pr.message)
        await putCapaToR2(pr.data.uploadUrl, capaFile, pr.data.contentType)
        nextValues = {
          ...values,
          imagemCapaUrl: pr.data.publicUrl,
          storageKeyCapa: pr.data.key,
        }
      }
      if (nextValues.imagemCapaUrl?.trim() || nextValues.storageKeyCapa?.trim()) {
        await updateMutation.mutateAsync({
          id: created.id,
          body: formValuesToEventoInput(nextValues),
        })
      }
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
          {showCompanyField ? <EventJsonImporter onApply={handleImportApply} /> : null}
          <EventForm
            key={`new-${categoryOptions.map((c) => c.id).join('-')}-${formNonce}`}
            defaultValues={defaultValues}
            categoryOptions={categoryOptions}
            companies={companiesQuery.data ?? []}
            showCompanyField={showCompanyField}
            onSubmit={onSubmit}
            onCancel={() => navigate('/admin/eventos')}
            submitLabel="Criar evento"
          />
        </>
      )}
    </Box>
  )
}
