import axiosClient from './axiosClient'
import type { ApiResponse, Department, Position, ScheduleCatalog } from '../types'

export interface DepartmentPayload {
  name: string
  code: string
}

export interface PositionPayload {
  name: string
  departmentId: string
}

export interface SchedulePayload {
  name: string
  timezone: string
  startTime: string
  endTime: string
}

export const fetchDepartments = async () => {
  const response = await axiosClient.get<ApiResponse<Department[]>>('/catalogs/departments')
  return response.data.data ?? []
}

export const fetchSchedules = async () => {
  const response = await axiosClient.get<ApiResponse<ScheduleCatalog[]>>('/catalogs/schedules')
  return response.data.data ?? []
}

export const fetchPositions = async () => {
  const response = await axiosClient.get<ApiResponse<Position[]>>('/catalogs/positions')
  return response.data.data ?? []
}

export const createDepartment = async (payload: DepartmentPayload) => {
  const response = await axiosClient.post<ApiResponse<Department>>('/catalogs/departments', payload)
  return response.data.data
}

export const updateDepartment = async (id: string, payload: DepartmentPayload) => {
  const response = await axiosClient.put<ApiResponse<Department>>(`/catalogs/departments/${id}`, payload)
  return response.data.data
}

export const deleteDepartment = async (id: string) => {
  await axiosClient.delete(`/catalogs/departments/${id}`)
}

export const createPosition = async (payload: PositionPayload) => {
  const response = await axiosClient.post<ApiResponse<Position>>('/catalogs/positions', payload)
  return response.data.data
}

export const updatePosition = async (id: string, payload: PositionPayload) => {
  const response = await axiosClient.put<ApiResponse<Position>>(`/catalogs/positions/${id}`, payload)
  return response.data.data
}

export const deletePosition = async (id: string) => {
  await axiosClient.delete(`/catalogs/positions/${id}`)
}

export const createSchedule = async (payload: SchedulePayload) => {
  const response = await axiosClient.post<ApiResponse<ScheduleCatalog>>('/catalogs/schedules', payload)
  return response.data.data
}

export const updateSchedule = async (id: string, payload: SchedulePayload) => {
  const response = await axiosClient.put<ApiResponse<ScheduleCatalog>>(`/catalogs/schedules/${id}`, payload)
  return response.data.data
}

export const deleteSchedule = async (id: string) => {
  await axiosClient.delete(`/catalogs/schedules/${id}`)
}
