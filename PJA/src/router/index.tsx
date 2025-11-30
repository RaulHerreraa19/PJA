import { Navigate, useRoutes } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import LoginPage from '../pages/auth/LoginPage'
import DashboardPage from '../pages/dashboard/DashboardPage'
import EmployeesPage from '../pages/employees/EmployeesPage'
import AttendancePage from '../pages/attendance/AttendancePage'
import PeriodsPage from '../pages/periods/PeriodsPage'
import IncidencesPage from '../pages/incidences/IncidencesPage'
import ReportsPage from '../pages/reports/ReportsPage'
import CatalogsPage from '../pages/catalogs/CatalogsPage'
import NotFoundPage from '../pages/not-found/NotFoundPage'
import ProtectedRoute from '../components/routing/ProtectedRoute'

const AppRoutes = () => {
  const element = useRoutes([
    {
      element: <AuthLayout />,
      children: [{ path: '/login', element: <LoginPage /> }],
    },
    {
      element: (
        <ProtectedRoute roles={['admin', 'rh', 'user', 'ti', 'jefaturas-adscripciones']}>
          <DashboardLayout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: '/dashboard', element: <DashboardPage /> },
        {
          path: '/employees',
          element: (
            <ProtectedRoute roles={['admin', 'rh', 'ti', 'jefaturas-adscripciones']}>
              <EmployeesPage />
            </ProtectedRoute>
          ),
        },
        {
          path: '/attendance',
          element: (
            <ProtectedRoute roles={['admin', 'rh', 'ti', 'jefaturas-adscripciones']}>
              <AttendancePage />
            </ProtectedRoute>
          ),
        },
        {
          path: '/periods',
          element: (
            <ProtectedRoute roles={['admin', 'rh', 'ti', 'jefaturas-adscripciones']}>
              <PeriodsPage />
            </ProtectedRoute>
          ),
        },
        {
          path: '/incidences',
          element: (
            <ProtectedRoute roles={['admin', 'rh', 'ti', 'jefaturas-adscripciones']}>
              <IncidencesPage />
            </ProtectedRoute>
          ),
        },
        {
          path: '/reports',
          element: (
            <ProtectedRoute roles={['admin', 'rh', 'user', 'ti', 'jefaturas-adscripciones']}>
              <ReportsPage />
            </ProtectedRoute>
          ),
        },
        {
          path: '/catalogs',
          element: (
            <ProtectedRoute roles={['admin', 'ti']}>
              <CatalogsPage />
            </ProtectedRoute>
          ),
        },
      ],
    },
    { path: '*', element: <NotFoundPage /> },
  ])

  return element
}

export default AppRoutes
