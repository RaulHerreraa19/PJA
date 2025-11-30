import axiosClient from './axiosClient'
import type { ApiResponse, Incidence, IncidenceStatus } from '../types'

export interface IncidenceFilters {
  status?: IncidenceStatus
}

export interface CreateIncidencePayload {
  employeeId: string
  type: Incidence['type']
  occurredAt: string
  minutes?: number
  notes?: string
  ruleId?: string
  attendanceId?: string
}

export const fetchIncidences = async (params?: IncidenceFilters) => {
  const response = await axiosClient.get<ApiResponse<Incidence[]>>('/incidences', { params })
  return response.data.data ?? []
}

export const updateIncidenceStatus = async (id: string, payload: { status: IncidenceStatus; notes?: string }) => {
  const response = await axiosClient.patch<ApiResponse<Incidence>>(`/incidences/${id}`, payload)
  return response.data.data
}

export const createIncidence = async (payload: CreateIncidencePayload) => {
  const response = await axiosClient.post<ApiResponse<Incidence>>('/incidences', payload)
  return response.data.data
}
