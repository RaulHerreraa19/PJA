import axiosClient from './axiosClient'
import type { ApiResponse, Employee } from '../types'

export interface EmployeePayload {
  employeeCode: string
  firstName: string
  lastName: string
  email?: string
  status: 'active' | 'inactive'
  hireDate?: string
  supportDocument?: File | null
  departmentId?: string
  scheduleId?: string
}

const buildBody = (payload: EmployeePayload) => {
  const { supportDocument, ...rest } = payload
  if (supportDocument instanceof File) {
    const formData = new FormData()
    Object.entries(rest).forEach(([key, value]) => {
      if (typeof value === 'undefined' || value === null) return
      formData.append(key, String(value))
    })
    formData.append('supportDocument', supportDocument)
    return { data: formData, headers: { 'Content-Type': 'multipart/form-data' } }
  }

  return { data: rest, headers: undefined }
}

export const fetchEmployees = async () => {
  const response = await axiosClient.get<ApiResponse<Employee[]>>('/employees')
  return response.data.data ?? []
}

export const createEmployee = async (payload: EmployeePayload) => {
  const { data, headers } = buildBody(payload)
  const response = await axiosClient.post<ApiResponse<Employee>>('/employees', data, { headers })
  return response.data.data
}

export const updateEmployee = async (id: string, payload: EmployeePayload) => {
  const { data, headers } = buildBody(payload)
  const response = await axiosClient.put<ApiResponse<Employee>>(`/employees/${id}`, data, { headers })
  return response.data.data
}

export const deleteEmployee = async (id: string) => {
  await axiosClient.delete(`/employees/${id}`)
}
