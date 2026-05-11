import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from '@/app/AdminLayout'
import { ProtectedRoute } from '@/app/ProtectedRoute'
import { LoginPage } from '@/features/auth/LoginPage'
import { EventsListPage } from '@/features/events/pages/EventsListPage'
import { EventNewPage } from '@/features/events/pages/EventNewPage'
import { EventEditPage } from '@/features/events/pages/EventEditPage'
import { CompaniesListPage } from '@/features/companies/pages/CompaniesListPage'
import { CompanyFormPage } from '@/features/companies/pages/CompanyFormPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="eventos" replace />} />
          <Route path="eventos" element={<EventsListPage />} />
          <Route path="eventos/novo" element={<EventNewPage />} />
          <Route path="eventos/:id/editar" element={<EventEditPage />} />
          <Route path="empresas" element={<CompaniesListPage />} />
          <Route path="empresas/nova" element={<CompanyFormPage />} />
          <Route path="empresas/:id/editar" element={<CompanyFormPage />} />
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/admin/eventos" replace />} />
      <Route path="*" element={<Navigate to="/admin/eventos" replace />} />
    </Routes>
  )
}
