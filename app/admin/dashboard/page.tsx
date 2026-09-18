'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
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
import { AdminTab, AdminUser, AttendanceRecord, AbsenceRequest, Student, Role, AttendanceStatus, HubSettingData, DEFAULT_HUB_SETTINGS } from '@/components/admin/types'

type DashboardPayload = {
  students: Student[]
  records: AttendanceRecord[]
  absences: AbsenceRequest[]
  setting: HubSettingData
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [absences, setAbsences] = useState<AbsenceRequest[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | AttendanceStatus>('all')
  const [manualOpen, setManualOpen] = useState(false)
  const [addStudentOpen, setAddStudentOpen] = useState(false)
  const [hubSetting, setHubSetting] = useState<HubSettingData>(DEFAULT_HUB_SETTINGS)

  const loadDashboard = useCallback(async (silent = false) => {
    const response = await fetch('/api/admin/dashboard', { cache: 'no-store' })
    if (response.status === 401) { router.replace('/admin/login'); return false }
    if (!response.ok) { if (!silent) toast.error('Unable to load dashboard records'); return false }
    const data = await response.json() as DashboardPayload
    setStudents(data.students)
    setRecords(data.records)
    setAbsences(data.absences)
    if (data.setting) {
      setHubSetting(data.setting)
    }
    return true
  }, [router])

  useEffect(() => {
    let active = true
    const initialise = async () => {
      const response = await fetch('/api/admin/session', { cache: 'no-store' })
      if (!response.ok) { router.replace('/admin/login'); return }
      const { user } = await response.json()
      if (!active) return
      setAdminUser(user); setIsAuthorized(true); await loadDashboard()
      if (active) setLoading(false)
    }
    initialise(); return () => { active = false }
  }, [loadDashboard, router])

  useEffect(() => {
    if (!isAuthorized) return
    const timer = window.setInterval(() => { loadDashboard(true) }, 15000)
    const refresh = () => { if (document.visibilityState === 'visible') loadDashboard(true) }
    window.addEventListener('focus', refresh); document.addEventListener('visibilitychange', refresh)
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh) }
  }, [isAuthorized, loadDashboard])

  const action = async (url: string, options: RequestInit) => {
    const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json' } })
    if (response.status === 401) { router.replace('/admin/login'); return false }
    const body = await response.json().catch(() => ({}))
    if (!response.ok) { toast.error(body.error || 'Unable to save changes'); return false }
    await loadDashboard(true); return true
  }
  const logout = async () => { await fetch('/api/admin/session', { method: 'DELETE' }); router.replace('/admin/login') }
  const addRecord = async (record: AttendanceRecord) => {
    if (await action('/api/admin/dashboard', { method: 'POST', body: JSON.stringify(record) })) {
      toast.success(`Check-in recorded for ${record.name}`)
    }
  }
  const deleteRecord = async (id: string) => {
    if (await action(`/api/admin/dashboard?id=${encodeURIComponent(id)}`, { method: 'DELETE' })) {
      toast.success('Attendance record deleted')
    }
  }
  const addStudent = async (student: Student) => { if (await action('/api/admin/participants', { method: 'POST', body: JSON.stringify(student) })) toast.success(`Registered ${student.name}`) }
  const addBulkStudents = async (newStudents: Student[]) => {
    if (await action('/api/admin/participants', { method: 'POST', body: JSON.stringify({ bulk: newStudents }) })) {
      toast.success(`${newStudents.length} participants imported successfully`)
    }
  }
  const deleteStudent = async (id: string) => { if (await action(`/api/admin/participants?id=${encodeURIComponent(id)}`, { method: 'DELETE' })) toast.success('Participant removed') }
  const absenceAction = async (absenceId: string, status: 'approved' | 'rejected') => { if (await action('/api/admin/dashboard', { method: 'PATCH', body: JSON.stringify({ absenceId, status }) })) toast.success(`Absence request ${status}`) }
  const saveSettings = async (updated: Partial<HubSettingData>) => {
    const ok = await action('/api/admin/dashboard', { method: 'PATCH', body: JSON.stringify(updated) })
    if (ok) {
      setHubSetting((prev) => ({ ...prev, ...updated }))
    }
    return ok
  }

  const todayLagosDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos' }).format(new Date())
    } catch {
      return new Date().toISOString().slice(0, 10)
    }
  }, [])

  const filteredRecords = useMemo(() => records.filter((r) => (r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.identifier.toLowerCase().includes(searchQuery.toLowerCase()) || r.track.toLowerCase().includes(searchQuery.toLowerCase())) && (roleFilter === 'all' || r.role === roleFilter) && (statusFilter === 'all' || r.status === statusFilter)), [records, searchQuery, roleFilter, statusFilter])

  const stats = useMemo(() => {
    const todayRecords = records.filter((r) => r.date === todayLagosDate || r.timestamp?.startsWith(todayLagosDate))
    const todayTotal = todayRecords.length
    const todayStudents = todayRecords.filter((r) => r.role === 'student').length
    const todayStaff = todayRecords.filter((r) => r.role === 'mentor').length
    const todayOnTime = todayRecords.filter((r) => r.status === 'on-time').length
    const todayOnTimeRate = todayTotal ? Math.round((todayOnTime / todayTotal) * 100) : 0

    const allTotal = records.length
    const allStudents = records.filter((r) => r.role === 'student').length
    const allStaff = records.filter((r) => r.role === 'mentor').length
    const allOnTime = records.filter((r) => r.status === 'on-time').length
    const allOnTimeRate = allTotal ? Math.round((allOnTime / allTotal) * 100) : 0

    return {
      todayTotal,
      todayStudents,
      todayStaff,
      todayOnTimeRate,
      allTotal,
      allStudents,
      allStaff,
      allOnTimeRate,
      pendingAbsences: absences.filter((a) => a.status === 'pending').length,
      totalEnrolledStudents: students.length,
    }
  }, [records, absences, students.length, todayLagosDate])

  const exportCsv = () => { const content = [['Name', 'Role', 'Identifier', 'Track', 'Check-in Time', 'Date', 'Distance (m)', 'Status'], ...filteredRecords.map((r) => [r.name, r.role, r.identifier, r.track, r.checkInTime, r.date || '', String(r.distanceMeters), r.status])].map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(',')).join('\n'); const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([content], { type: 'text/csv' })); link.download = `bluehouse-hub-attendance-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(link.href) }

  if (!isAuthorized || loading) return <div className="min-h-screen flex items-center justify-center bg-[#F4EFFB]"><p className="text-slate-600 text-sm font-medium">Loading secure admin dashboard...</p></div>
  return <div className="min-h-screen bg-[#f7f8fd] text-slate-900"><div className="mx-auto flex min-h-screen w-full max-w-[1800px] flex-col">
    <AdminHeader activeTab={activeTab} onOpenSidebar={() => setIsSidebarOpen(true)} onOpenManualModal={() => setManualOpen(true)} onExportCSV={exportCsv} adminUser={adminUser} onLogout={logout} />
    <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} pendingAbsencesCount={stats.pendingAbsences} totalAttendanceCount={stats.todayTotal} totalStudentsCount={students.length} adminUser={adminUser} onLogout={logout} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    <main className="mx-3 mt-10 flex-1 rounded-t-[28px] border border-[#e4e1ee] bg-white/90 p-4 sm:mx-6 sm:p-6 lg:mx-12 lg:mt-12 lg:p-8">
      {activeTab === 'overview' && <div className="space-y-6"><StatsOverview stats={stats} onNavigateTab={setActiveTab} /><AttendanceTable records={filteredRecords} searchQuery={searchQuery} setSearchQuery={setSearchQuery} roleFilter={roleFilter} setRoleFilter={setRoleFilter} statusFilter={statusFilter} setStatusFilter={setStatusFilter} onDeleteRecord={deleteRecord} /><AnalyticsView records={records} students={students} setting={hubSetting} /></div>}
      {activeTab === 'attendance' && <AttendanceTable records={filteredRecords} searchQuery={searchQuery} setSearchQuery={setSearchQuery} roleFilter={roleFilter} setRoleFilter={setRoleFilter} statusFilter={statusFilter} setStatusFilter={setStatusFilter} onDeleteRecord={deleteRecord} />}
      {activeTab === 'students' && <StudentsView students={students} records={records} onOpenAddModal={() => setAddStudentOpen(true)} onDeleteStudent={deleteStudent} />}
      {activeTab === 'absences' && <AbsenceReports absences={absences} onAbsenceAction={absenceAction} />}
      {activeTab === 'analytics' && <AnalyticsView records={records} students={students} setting={hubSetting} />}
      {activeTab === 'settings' && <SettingsView setting={hubSetting} onSave={saveSettings} />}
    </main></div>
    <ManualCheckinModal isOpen={manualOpen} onClose={() => setManualOpen(false)} onAddRecord={addRecord} students={students} />
    <AddStudentModal isOpen={addStudentOpen} onClose={() => setAddStudentOpen(false)} onAddStudent={addStudent} onAddBulkStudents={addBulkStudents} />
  </div>
}
