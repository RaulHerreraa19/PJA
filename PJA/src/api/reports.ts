import axiosClient from './axiosClient'
import type { ApiResponse } from '../types'

export interface PeriodReportFilters {
  periodId: string
  departmentId?: string
  positionId?: string
  employeeId?: string
  status?: 'present' | 'absent' | 'late' | 'leave'
}

export interface PeriodReportPayload {
  excel: string
  pdf: string
  excelMime: string
  pdfMime: string
}

export const generatePeriodReport = async (filters: PeriodReportFilters) => {
  const response = await axiosClient.post<ApiResponse<PeriodReportPayload>>('/reports/period', filters)
  return response.data.data
}
