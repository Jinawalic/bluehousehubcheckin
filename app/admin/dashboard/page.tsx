'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

// Modular Components
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import { StatsOverview } from '@/components/admin/stats-overview'
import { AttendanceTable } from '@/components/admin/attendance-table'
import { StudentsView } from '@/components/admin/students-view'
import { AbsenceReports } from '@/components/admin/absence-reports'
import { AnalyticsView } from '@/components/admin/analytics-view'
import { SettingsView } from '@/components/admin/settings-view'
import { ManualCheckinModal } from '@/components/admin/manual-checkin-modal'
import { AddStudentModal } from '@/components/admin/add-student-modal'

// Types
import {
  AdminTab,
  AdminUser,
  AttendanceRecord,
  AbsenceRequest,
  Student,
  Role,
  AttendanceStatus,
} from '@/components/admin/types'

// Initial realistic mock data for Blue House Hub
const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-001',
    name: 'Samuel Adekunle',
    role: 'student',
    identifier: 'BHH/24/001',
    track: 'Full-Stack Web Development',
    email: 'samuel.a@bluehouse.tech',
    phone: '08031234567',
    registeredAt: '12 Jan 2026',
    status: 'active',
  },
  {
    id: 'std-002',
    name: 'Blessing Chioma',
    role: 'student',
    identifier: 'BHH/24/014',
    track: 'Data Science & Artificial Intelligence',
    email: 'blessing.c@bluehouse.tech',
    phone: '08129876543',
    registeredAt: '15 Jan 2026',
    status: 'active',
  },
  {
    id: 'std-003',
    name: 'Dr. Michael Olanrewaju',
    role: 'mentor',
    identifier: 'BHS/24/002',
    track: 'Faculty / Lead Instructor',
    email: 'm.olanrewaju@bluehouse.tech',
    registeredAt: '02 Jan 2026',
    status: 'active',
  },
  {
    id: 'std-004',
    name: 'Fatima Ibrahim',
    role: 'corper',
    identifier: 'PL/24A/0842',
    track: 'UI/UX & Product Design',
    email: 'fatima.i@bluehouse.tech',
    registeredAt: '10 Feb 2026',
    status: 'active',
  },
  {
    id: 'std-005',
    name: 'Emmanuel Gyang',
    role: 'student',
    identifier: 'BHH/24/032',
    track: 'Cybersecurity & Network Defense',
    email: 'emmanuel.g@bluehouse.tech',
    registeredAt: '18 Jan 2026',
    status: 'active',
  },
  {
    id: 'std-006',
    name: 'Aisha Bello',
    role: 'mentor',
    identifier: 'BHS/24/007',
    track: 'Cloud Infrastructure & DevOps',
    email: 'aisha.bello@bluehouse.tech',
    registeredAt: '05 Jan 2026',
    status: 'active',
  },
  {
    id: 'std-007',
    name: 'Daniel Pam',
    role: 'corper',
    identifier: 'PL/24A/1105',
    track: 'Software Engineering',
    email: 'daniel.pam@bluehouse.tech',
    registeredAt: '12 Feb 2026',
    status: 'active',
  },
  {
    id: 'std-008',
    name: 'Grace Nwosu',
    role: 'student',
    identifier: 'BHH/24/019',
    track: 'Full-Stack Web Development',
    email: 'grace.n@bluehouse.tech',
    registeredAt: '16 Jan 2026',
    status: 'active',
  },
  {
    id: 'std-009',
    name: 'Joshua Bitrus',
    role: 'student',
    identifier: 'BHH/24/045',
    track: 'Data Science & Artificial Intelligence',
    email: 'joshua.b@bluehouse.tech',
    registeredAt: '20 Jan 2026',
    status: 'active',
  },
]

const INITIAL_RECORDS: AttendanceRecord[] = [
  {
    id: 'att-001',
    name: 'Samuel Adekunle',
    role: 'student',
    identifier: 'BHH/24/001',
    track: 'Full-Stack Web Dev',
    checkInTime: '09:12 AM',
    distanceMeters: 14,
    status: 'on-time',
  },
  {
    id: 'att-002',
    name: 'Blessing Chioma',
    role: 'student',
    identifier: 'BHH/24/014',
    track: 'Data Science & AI',
    checkInTime: '09:15 AM',
    distanceMeters: 28,
    status: 'on-time',
  },
  {
    id: 'att-003',
    name: 'Dr. Michael Olanrewaju',
    role: 'mentor',
    identifier: 'BHS/24/002',
    track: 'Faculty / Lead Instructor',
    checkInTime: '09:05 AM',
    distanceMeters: 8,
    status: 'on-time',
  },
  {
    id: 'att-004',
    name: 'Fatima Ibrahim',
    role: 'corper',
    identifier: 'PL/24A/0842',
    track: 'UI/UX & Product Design',
    checkInTime: '09:22 AM',
    distanceMeters: 35,
    status: 'on-time',
  },
  {
    id: 'att-005',
    name: 'Emmanuel Gyang',
    role: 'student',
    identifier: 'BHH/24/032',
    track: 'Cybersecurity',
    checkInTime: '10:45 AM',
    distanceMeters: 42,
    status: 'late',
    notes: 'Transport delay reported',
  },
  {
    id: 'att-006',
    name: 'Aisha Bello',
    role: 'mentor',
    identifier: 'BHS/24/007',
    track: 'Cloud Computing Mentor',
    checkInTime: '08:55 AM',
    distanceMeters: 12,
    status: 'on-time',
  },
  {
    id: 'att-007',
    name: 'Daniel Pam',
    role: 'corper',
    identifier: 'PL/24A/1105',
    track: 'Software Engineering',
    checkInTime: '09:30 AM',
    distanceMeters: 19,
    status: 'on-time',
  },
  {
    id: 'att-008',
    name: 'Grace Nwosu',
    role: 'student',
    identifier: 'BHH/24/019',
    track: 'Full-Stack Web Dev',
    checkInTime: '09:41 AM',
    distanceMeters: 22,
    status: 'on-time',
  },
  {
    id: 'att-009',
    name: 'Joshua Bitrus',
    role: 'student',
    identifier: 'BHH/24/045',
    track: 'Data Science & AI',
    checkInTime: '11:10 AM',
    distanceMeters: 55,
    status: 'late',
  },
]

const INITIAL_ABSENCES: AbsenceRequest[] = [
  {
    id: 'abs-001',
    name: 'Khadija Usman',
    role: 'student',
    identifier: 'BHH/24/027',
    reason: 'University continuous assessment test scheduled for today.',
    submittedAt: 'Today, 08:30 AM',
    status: 'pending',
  },
  {
    id: 'abs-002',
    name: 'David Chuwang',
    role: 'student',
    identifier: 'BHH/24/018',
    reason: 'Medical appointment at Jos University Teaching Hospital.',
    submittedAt: 'Today, 08:45 AM',
    status: 'pending',
  },
  {
    id: 'abs-003',
    name: 'Victor Lar',
    role: 'corper',
    identifier: 'PL/24A/0912',
    reason: 'NYSC Community Development Service (CDS) mandatory meeting.',
    submittedAt: 'Yesterday, 06:15 PM',
    status: 'approved',
  },
]

export default function AdminDashboardPage() {
  const router = useRouter()

  // Authentication State
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)

  // Layout & Navigation State
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Live Records & Students Data
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS)
  const [records, setRecords] = useState<AttendanceRecord[]>(INITIAL_RECORDS)
  const [absences, setAbsences] = useState<AbsenceRequest[]>(INITIAL_ABSENCES)

  // Search & Filter State (Attendance)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | AttendanceStatus>('all')

  // Modals & Settings
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState('')
  const [geofenceRadius, setGeofenceRadius] = useState('100')

  // Auth Guard
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuth = localStorage.getItem('hub_admin_auth') === 'true'
      if (!isAuth) {
        toast.error('Session expired or unauthorized', {
          description: 'Please sign in with your administrative account.',
        })
        router.replace('/admin/login')
        return
      }

      setIsAuthorized(true)
      const userStr = localStorage.getItem('hub_admin_user')
      if (userStr) {
        try {
          setAdminUser(JSON.parse(userStr))
        } catch {
          setAdminUser({
            name: 'Hub Director',
            email: 'admin@bluehouse.tech',
            role: 'Super Administrator',
            avatar: 'BH',
          })
        }
      } else {
        setAdminUser({
          name: 'Hub Director',
          email: 'admin@bluehouse.tech',
          role: 'Super Administrator',
          avatar: 'BH',
        })
      }
    }
  }, [router])

  // Lagos Clock Live Update
  useEffect(() => {
    const updateTime = () => {
      const formatted = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Lagos',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }).format(new Date())
      setCurrentTime(formatted)
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // Logout Handler
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hub_admin_auth')
      localStorage.removeItem('hub_admin_user')
    }
    toast.success('Logged out successfully')
    router.replace('/admin/login')
  }

  // Filtered attendance list
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.track.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole = roleFilter === 'all' || r.role === roleFilter
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [records, searchQuery, roleFilter, statusFilter])

  // Summary statistics
  const stats = useMemo(() => {
    const total = records.length
    const studentsCount = records.filter((r) => r.role === 'student').length
    const staff = records.filter((r) => r.role === 'mentor').length
    const corpers = records.filter((r) => r.role === 'corper').length
    const pendingAbsences = absences.filter((a) => a.status === 'pending').length
    const onTimeRate =
      total > 0 ? Math.round((records.filter((r) => r.status === 'on-time').length / total) * 100) : 100

    return { total, students: studentsCount, staff, corpers, pendingAbsences, onTimeRate }
  }, [records, absences])

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Name', 'Role', 'Identifier', 'Track', 'Check-in Time', 'Distance (m)', 'Status']
    const rows = filteredRecords.map((r) => [
      `"${r.name}"`,
      `"${r.role}"`,
      `"${r.identifier}"`,
      `"${r.track}"`,
      `"${r.checkInTime}"`,
      r.distanceMeters,
      `"${r.status}"`,
    ])
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute(
      'download',
      `bluehouse-hub-attendance-${new Date().toISOString().slice(0, 10)}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Attendance CSV exported successfully')
  }

  // Handle Manual check-in addition
  const handleAddRecord = (record: AttendanceRecord) => {
    setRecords((prev) => [record, ...prev])
  }

  // Handle Add Student (Single)
  const handleAddStudent = (newStudent: Student) => {
    setStudents((prev) => [newStudent, ...prev])
  }

  // Handle Add Student (Bulk)
  const handleAddBulkStudents = (newStudents: Student[]) => {
    setStudents((prev) => [...newStudents, ...prev])
  }

  // Handle Delete Student
  const handleDeleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id))
  }

  // Handle Absence decision
  const handleAbsenceAction = (id: string, action: 'approved' | 'rejected') => {
    setAbsences((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: action } : item))
    )
    toast.success(`Absence request ${action}`)
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4EFFB]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 text-sm font-medium">Verifying Admin Session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F6FC] text-slate-900 font-sans selection:bg-purple-200 selection:text-purple-900 flex">
      {/* 1. Sidebar Component with links */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingAbsencesCount={stats.pendingAbsences}
        totalAttendanceCount={stats.total}
        totalStudentsCount={students.length}
        adminUser={adminUser}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Wrapper (Offset for fixed sidebar on lg screens) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* 2. Top Header Component */}
        <AdminHeader
          activeTab={activeTab}
          currentTime={currentTime}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenManualModal={() => setIsManualModalOpen(true)}
          onExportCSV={handleExportCSV}
          adminUser={adminUser}
        />

        {/* 3. Main Body Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Top KPI Stat Cards */}
          <StatsOverview stats={stats} onNavigateTab={setActiveTab} />

          {/* Conditional View Rendering based on active tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <AttendanceTable
                records={filteredRecords}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                roleFilter={roleFilter}
                setRoleFilter={setRoleFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
              />
              <AnalyticsView />
            </div>
          )}

          {activeTab === 'attendance' && (
            <AttendanceTable
              records={filteredRecords}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />
          )}

          {activeTab === 'students' && (
            <StudentsView
              students={students}
              onOpenAddModal={() => setIsAddStudentModalOpen(true)}
              onDeleteStudent={handleDeleteStudent}
            />
          )}

          {activeTab === 'absences' && (
            <AbsenceReports absences={absences} onAbsenceAction={handleAbsenceAction} />
          )}

          {activeTab === 'analytics' && <AnalyticsView />}

          {activeTab === 'settings' && (
            <SettingsView
              geofenceRadius={geofenceRadius}
              setGeofenceRadius={setGeofenceRadius}
            />
          )}
        </main>
      </div>

      {/* 4. Manual Attendance Check-in Override Modal */}
      <ManualCheckinModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onAddRecord={handleAddRecord}
      />

      {/* 5. Add Student / Participant Modal (Manual or Bulk CSV with Role Selection) */}
      <AddStudentModal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        onAddStudent={handleAddStudent}
        onAddBulkStudents={handleAddBulkStudents}
      />
    </div>
  )
}
