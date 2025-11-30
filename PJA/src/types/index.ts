export type Role = 'admin' | 'rh' | 'user' | 'jefaturas-adscripciones' | 'ti'

export interface ApiResponse<T> {
  status: 'success' | 'error'
  data: T
  error?: string
  meta?: Record<string, unknown>
}

export interface User {
  id: string
  email: string
  role: Role
  name?: string
}

export interface BasicReference {
  id: string
  name: string
}

export interface ScheduleReference {
  id: string
  name: string
  startTime: string
  endTime: string
  timezone?: string
}

export interface Department {
  id: string
  name: string
  code: string
}

export interface ScheduleCatalog {
  id: string
  name: string
  startTime: string
  endTime: string
  timezone: string
}

export interface Position {
  id: string
  name: string
  departmentId: string
  department?: Department
}

export interface Employee {
  id: string
  employeeCode: string
  firstName: string
  lastName: string
  email?: string | null
  status: 'active' | 'inactive'
  department?: BasicReference | null
  position?: BasicReference | null
  schedule?: ScheduleReference | null
  hireDate?: string | null
}

export interface AttendanceRecord {
  id: string
  employeeId: string
  date: string
  checkIn?: string | null
  checkOut?: string | null
  status: 'present' | 'absent' | 'late' | 'leave'
  totalMinutes?: number | null
  employee?: Employee
}

export interface Period {
  id: string
  name: string
  startDate: string
  endDate: string
  status: 'open' | 'closed'
}

export interface IncidenceRule {
  id: string
  name: string
  description?: string | null
  type: 'delay' | 'absence' | 'overtime'
  thresholdMinutes?: number | null
  penalty?: string | null
}

export type IncidenceType = 'delay' | 'absence' | 'early_exit' | 'overtime'
export type IncidenceStatus = 'pending' | 'acknowledged' | 'dismissed'

export interface Incidence {
  id: string
  employeeId: string
  attendanceId?: string | null
  ruleId?: string | null
  type: IncidenceType
  occurredAt: string
  minutes?: number | null
  status: IncidenceStatus
  notes?: string | null
  employee?: Employee
  rule?: IncidenceRule | null
}
