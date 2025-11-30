import axios, { AxiosHeaders } from 'axios'
import authStore from '../store/authStore'

const axiosClient = axios.create({
  // `VITE_API_URL` debe definirse en .env para apuntar al backend (ver .env.example)
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api',
  timeout: 10000,
  withCredentials: true,
})

axiosClient.interceptors.request.use((config) => {
  const token = authStore.getState().token

  if (token) {
    const headers =
      config.headers instanceof AxiosHeaders ? config.headers : new AxiosHeaders(config.headers ?? {})
    headers.set('Authorization', `Bearer ${token}`)
    config.headers = headers
  }

  return config
})

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const requestUrl = error.config?.url ?? ''
    const { token, user } = authStore.getState()

    const isAuthEndpoint = ['/auth/login', '/auth/logout', '/auth/refresh'].some((endpoint) =>
      requestUrl.includes(endpoint),
    )

    if (status === 401 && !isAuthEndpoint && (token || user)) {
      authStore.getState().logout()
    }

    return Promise.reject(error)
  },
)

export default axiosClient
