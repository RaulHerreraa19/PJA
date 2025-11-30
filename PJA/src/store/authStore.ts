import { create } from 'zustand'
import { loginRequest, logoutRequest, refreshSession } from '../api/auth'
import type { Role, User } from '../types'

interface Credentials {
  email: string
  password: string
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
  hydrated: boolean
  login: (credentials: Credentials) => Promise<void>
  logout: () => Promise<void>
  hydrate: () => Promise<void>
  hasRole: (allowedRoles?: Role[]) => boolean
}

const deriveName = (email: string) => email.split('@')[0] ?? email

const authStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  error: null,
  hydrated: false,
  async login(credentials) {
    set({ loading: true, error: null })
    try {
      const session = await loginRequest(credentials)
      set({
        user: { ...session.user, name: deriveName(session.user.email) },
        token: session.accessToken,
        loading: false,
        error: null,
        hydrated: true,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Credenciales invalidas'
      set({ loading: false, error: message })
      throw error
    }
  },
  async logout() {
    try {
      await logoutRequest()
    } catch (error) {
      // ignore
    } finally {
      set({ user: null, token: null, hydrated: true })
    }
  },
  async hydrate() {
    if (get().hydrated) return
    try {
      const session = await refreshSession()
      set({
        user: { ...session.user, name: deriveName(session.user.email) },
        token: session.accessToken,
        hydrated: true,
      })
    } catch (error) {
      set({ hydrated: true, user: null, token: null })
    }
  },
  hasRole(allowedRoles) {
    const { user } = get()
    if (!user) return false
    if (!allowedRoles || allowedRoles.length === 0) return true
    return allowedRoles.includes(user.role)
  },
}))

export default authStore
