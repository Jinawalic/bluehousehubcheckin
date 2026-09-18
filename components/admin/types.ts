export type Role = 'student' | 'mentor'
export type AttendanceStatus = 'on-time' | 'late' | 'excused'

export interface AttendanceRecord {
  id: string
  participantId?: string | null
  name: string
  role: Role
  identifier: string
  track: string
  checkInTime: string
  distanceMeters: number
  status: AttendanceStatus
  notes?: string
  date?: string
  timestamp?: string
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

export interface HubSettingData {
  id: string
  latitude: number
  longitude: number
  geofenceRadius: number
  openHour: number
  closeHour: number
  timezone: string
}

export interface AdminUser {
  name: string
  email: string
  role: string
  avatar?: string
}

export const DEFAULT_HUB_SETTINGS: HubSettingData = {
  id: 'default',
  latitude: 9.88452647721506,
  longitude: 8.876546119960212,
  geofenceRadius: 100,
  openHour: 9,
  closeHour: 18,
  timezone: 'Africa/Lagos',
}

export const STANDARD_TRACKS = [
  'Full-Stack Web Development',
  'Data Science & Artificial Intelligence',
  'UI/UX & Product Design',
  'Cybersecurity & Network Defense',
  'Cloud Infrastructure & DevOps',
  'Mobile App Development',
  'Front End Development',
  'Back End Development',
]

export type AdminTab = 'overview' | 'attendance' | 'students' | 'absences' | 'analytics' | 'settings'
