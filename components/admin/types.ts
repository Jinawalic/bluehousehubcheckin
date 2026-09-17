export type Role = 'student' | 'mentor'
export type AttendanceStatus = 'on-time' | 'late' | 'excused'

export interface AttendanceRecord {
  id: string
  name: string
  role: Role
  identifier: string
  track: string
  checkInTime: string
  distanceMeters: number
  status: AttendanceStatus
  notes?: string
  date?: string
}

export interface AbsenceRequest {
  id: string
  name: string
  role: Role
  identifier: string
  reason: string
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface Student {
  id: string
  name: string
  role: Role
  identifier: string
  track: string
  email?: string
  phone?: string
  registeredAt: string
  status: 'active' | 'inactive'
}

export interface AdminUser {
  name: string
  email: string
  role: string
  avatar?: string
}

export type AdminTab = 'overview' | 'attendance' | 'students' | 'absences' | 'analytics' | 'settings'
