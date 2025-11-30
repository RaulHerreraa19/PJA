import { useMemo } from 'react'
import authStore from '../store/authStore'
import type { Role } from '../types'

const useAuth = () => {
  const { user, token, loading, error, hydrated, login, logout, hasRole } = authStore((state) => state)

  return useMemo(
    () => ({
      user,
      token,
      loading,
      error,
      isAuthenticated: Boolean(user),
      hydrated,
      login,
      logout,
      hasRole: (roles?: Role[]) => hasRole(roles),
    }),
    [user, token, loading, error, hydrated, login, logout, hasRole],
  )
}

export default useAuth
