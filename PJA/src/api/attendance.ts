import axiosClient from './axiosClient'
import type { ApiResponse, AttendanceRecord } from '../types'

export interface AttendanceFilters {
  periodId?: string
  employeeId?: string
}

export const fetchAttendance = async (filters?: AttendanceFilters) => {
  const response = await axiosClient.get<ApiResponse<AttendanceRecord[]>>('/attendance', { params: filters })
  return response.data.data ?? []
}
