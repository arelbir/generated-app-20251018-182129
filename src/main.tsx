import { enableMapSet } from 'immer'
enableMapSet()
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary'
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { DashboardPage } from '@/pages/DashboardPage'
import { MembersPage } from '@/pages/MembersPage'
import { MemberProfilePage } from '@/pages/MemberProfilePage'
import { MonthlyIncomePage } from '@/pages/financials/MonthlyIncomePage'
import { DailyCashbookPage } from '@/pages/financials/DailyCashbookPage'
import { ExpiredPackagesPage } from '@/pages/reports/ExpiredPackagesPage'
import { AuditLogPage } from '@/pages/reports/AuditLogPage'
import { DeviceManagementPage } from '@/pages/settings/DeviceManagementPage'
import { EditMemberPage } from '@/pages/EditMemberPage'
import { HealthConditionsPage } from '@/pages/settings/HealthConditionsPage'
import { PackagesPage } from '@/pages/settings/PackagesPage'
import { StaffManagementPage } from '@/pages/settings/StaffManagementPage'
import { SpecializationsPage } from '@/pages/settings/SpecializationsPage'
const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'members', element: <MembersPage /> },
      { path: 'members/:id', element: <MemberProfilePage /> },
      { path: 'members/:id/edit', element: <EditMemberPage /> },
      { path: 'financials/income', element: <MonthlyIncomePage /> },
      { path: 'financials/cashbook', element: <DailyCashbookPage /> },
      { path: 'reports/expired-packages', element: <ExpiredPackagesPage /> },
      { path: 'reports/audit-log', element: <AuditLogPage /> },
      { path: 'settings', element: <DeviceManagementPage />, index: true },
      { path: 'settings/health-conditions', element: <HealthConditionsPage /> },
      { path: 'settings/packages', element: <PackagesPage /> },
      { path: 'settings/staff', element: <StaffManagementPage /> },
      { path: 'settings/specializations', element: <SpecializationsPage /> },
    ],
  },
])
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>
)