import axiosClient from './axiosClient'
import type { ApiResponse, IncidenceRule } from '../types'

export interface IncidenceRulePayload {
  name: string
  description?: string
  type: IncidenceRule['type']
  thresholdMinutes?: number
  penalty?: string
}

export const fetchIncidenceRules = async () => {
  const response = await axiosClient.get<ApiResponse<IncidenceRule[]>>('/incidence-rules')
  return response.data.data ?? []
}

export const createIncidenceRule = async (payload: IncidenceRulePayload) => {
  const response = await axiosClient.post<ApiResponse<IncidenceRule>>('/incidence-rules', payload)
  return response.data.data
}

export const updateIncidenceRule = async (id: string, payload: IncidenceRulePayload) => {
  const response = await axiosClient.put<ApiResponse<IncidenceRule>>(`/incidence-rules/${id}`, payload)
  return response.data.data
}

export const deleteIncidenceRule = async (id: string) => {
  await axiosClient.delete(`/incidence-rules/${id}`)
}
