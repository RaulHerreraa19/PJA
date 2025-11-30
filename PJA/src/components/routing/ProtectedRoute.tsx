import type { PropsWithChildren } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Center, Loader, Stack, Text } from '@mantine/core'
import type { Role } from '../../types'
import useAuth from '../../hooks/useAuth'

interface ProtectedRouteProps extends PropsWithChildren {
  roles?: Role[]
}

const ProtectedRoute = ({ roles, children }: ProtectedRouteProps) => {
  const location = useLocation()
  const { isAuthenticated, hasRole, hydrated } = useAuth()

  if (!hydrated) {
    return (
      <Center h="100vh" bg="neutralSlate.0">
        <Stack gap="xs" align="center">
          <Loader color="colimaBlue" variant="dots" />
          <Text size="sm" c="dimmed">
            Validando sesión...
          </Text>
        </Stack>
      </Center>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && roles.length > 0 && !hasRole(roles)) {
    return <Navigate to="/dashboard" replace />
  }

  if (children) {
    return <>{children}</>
  }

  return <Outlet />
}

export default ProtectedRoute
