import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from '@/app/AdminLayout'
import { ProtectedRoute } from '@/app/ProtectedRoute'
import { RoleRoute } from '@/app/RoleRoute'
import { LoginPage } from '@/features/auth/LoginPage'
import { EventsListPage } from '@/features/events/pages/EventsListPage'
import { EventNewPage } from '@/features/events/pages/EventNewPage'
import { EventEditPage } from '@/features/events/pages/EventEditPage'
import { EventMetricsPage } from '@/features/events/pages/EventMetricsPage'
import { CompaniesListPage } from '@/features/companies/pages/CompaniesListPage'
import { CompanyFormPage } from '@/features/companies/pages/CompanyFormPage'
import { CompanyDetailPage } from '@/features/companies/pages/CompanyDetailPage'
import { CategoriesListPage } from '@/features/categories/pages/CategoriesListPage'
import { CampanhasDestaquePage } from '@/features/appDestaque/pages/CampanhasDestaquePage'
import { RegioesDestaquePage } from '@/features/appDestaque/pages/RegioesDestaquePage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { LicensesPage } from '@/features/licenses/pages/LicensesPage'
import { MyLicensePage } from '@/features/licenses/pages/MyLicensePage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="eventos" element={<EventsListPage />} />
          <Route path="eventos/novo" element={<EventNewPage />} />
          <Route path="eventos/:id" element={<EventMetricsPage />} />
          <Route path="eventos/:id/editar" element={<EventEditPage />} />
          <Route element={<RoleRoute roles={['empresa']} />}>
            <Route path="minha-licenca" element={<MyLicensePage />} />
          </Route>
          <Route element={<RoleRoute roles={['super_admin']} />}>
            <Route path="categorias" element={<CategoriesListPage />} />
            <Route path="regioes-destaque" element={<RegioesDestaquePage />} />
            <Route path="campanhas-destaque" element={<CampanhasDestaquePage />} />
            <Route path="empresas" element={<CompaniesListPage />} />
            <Route path="empresas/nova" element={<CompanyFormPage />} />
            <Route path="empresas/:id" element={<CompanyDetailPage />} />
            <Route path="empresas/:id/editar" element={<CompanyFormPage />} />
            <Route path="licencas" element={<LicensesPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  )
}
