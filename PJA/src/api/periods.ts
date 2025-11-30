import axiosClient from './axiosClient'
import type { ApiResponse, Period } from '../types'

export const fetchPeriods = async () => {
  const response = await axiosClient.get<ApiResponse<Period[]>>('/periods')
  return response.data.data ?? []
}
