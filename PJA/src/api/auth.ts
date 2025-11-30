import axiosClient from './axiosClient'
import type { ApiResponse, User } from '../types'

interface AuthPayload {
  accessToken: string
  user: User
}

export interface LoginCredentials {
  email: string
  password: string
}

export const loginRequest = async (credentials: LoginCredentials) => {
  const response = await axiosClient.post<ApiResponse<AuthPayload>>('/auth/login', credentials)
  return response.data.data
}

export const refreshSession = async () => {
  const response = await axiosClient.post<ApiResponse<AuthPayload>>('/auth/refresh')
  return response.data.data
}

export const logoutRequest = async () => {
  await axiosClient.post('/auth/logout')
}
