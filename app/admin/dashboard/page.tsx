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
import { AdminTab, AdminUser, AttendanceRecord, AbsenceRequest, Student, Role, AttendanceStatus } from '@/components/admin/types'

type DashboardPayload = { students: Student[]; records: AttendanceRecord[]; absences: AbsenceRequest[]; setting: { geofenceRadius: number } }

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
  const [geofenceRadius, setGeofenceRadius] = useState('100')

  const loadDashboard = useCallback(async (silent = false) => {
    const response = await fetch('/api/admin/dashboard', { cache: 'no-store' })
    if (response.status === 401) { router.replace('/admin/login'); return false }
    if (!response.ok) { if (!silent) toast.error('Unable to load dashboard records'); return false }
    const data = await response.json() as DashboardPayload
    setStudents(data.students); setRecords(data.records); setAbsences(data.absences); setGeofenceRadius(String(data.setting.geofenceRadius))
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
  const addRecord = async (record: AttendanceRecord) => { if (await action('/api/admin/dashboard', { method: 'POST', body: JSON.stringify(record) })) toast.success(`Check-in recorded for ${record.name}`) }
  const addStudent = async (student: Student) => { if (await action('/api/admin/participants', { method: 'POST', body: JSON.stringify(student) })) toast.success(`Registered ${student.name}`) }
  const addBulkStudents = async (newStudents: Student[]) => { const results = await Promise.all(newStudents.map((student) => action('/api/admin/participants', { method: 'POST', body: JSON.stringify(student) }))); if (results.some(Boolean)) toast.success('Participants imported') }
  const deleteStudent = async (id: string) => { if (await action(`/api/admin/participants?id=${encodeURIComponent(id)}`, { method: 'DELETE' })) toast.success('Participant removed') }
  const absenceAction = async (absenceId: string, status: 'approved' | 'rejected') => { if (await action('/api/admin/dashboard', { method: 'PATCH', body: JSON.stringify({ absenceId, status }) })) toast.success(`Absence request ${status}`) }
  const saveSettings = async () => { if (await action('/api/admin/dashboard', { method: 'PATCH', body: JSON.stringify({ geofenceRadius: Number(geofenceRadius) }) })) toast.success('Geofence parameters saved') }

  const filteredRecords = useMemo(() => records.filter((r) => (r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.identifier.toLowerCase().includes(searchQuery.toLowerCase()) || r.track.toLowerCase().includes(searchQuery.toLowerCase())) && (roleFilter === 'all' || r.role === roleFilter) && (statusFilter === 'all' || r.status === statusFilter)), [records, searchQuery, roleFilter, statusFilter])
  const stats = useMemo(() => { const total = records.length; return { total, students: records.filter((r) => r.role === 'student').length, staff: records.filter((r) => r.role === 'mentor').length, pendingAbsences: absences.filter((a) => a.status === 'pending').length, onTimeRate: total ? Math.round(records.filter((r) => r.status === 'on-time').length / total * 100) : 0 } }, [records, absences])
  const exportCsv = () => { const content = [['Name', 'Role', 'Identifier', 'Track', 'Check-in Time', 'Distance (m)', 'Status'], ...filteredRecords.map((r) => [r.name, r.role, r.identifier, r.track, r.checkInTime, String(r.distanceMeters), r.status])].map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(',')).join('\n'); const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([content], { type: 'text/csv' })); link.download = `bluehouse-hub-attendance-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(link.href) }

  if (!isAuthorized || loading) return <div className="min-h-screen flex items-center justify-center bg-[#F4EFFB]"><p className="text-slate-600 text-sm font-medium">Loading secure admin dashboard...</p></div>
  return <div className="min-h-screen bg-[#f7f8fd] text-slate-900"><div className="mx-auto flex min-h-screen w-full max-w-[1800px] flex-col">
    <AdminHeader activeTab={activeTab} onOpenSidebar={() => setIsSidebarOpen(true)} onOpenManualModal={() => setManualOpen(true)} onExportCSV={exportCsv} adminUser={adminUser} onLogout={logout} />
    <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} pendingAbsencesCount={stats.pendingAbsences} totalAttendanceCount={stats.total} totalStudentsCount={students.length} adminUser={adminUser} onLogout={logout} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    <main className="mx-3 mt-10 flex-1 rounded-t-[28px] border border-[#e4e1ee] bg-white/90 p-4 sm:mx-6 sm:p-6 lg:mx-12 lg:mt-12 lg:p-8">
      {activeTab === 'overview' && <div className="space-y-6"><StatsOverview stats={stats} onNavigateTab={setActiveTab} /><AttendanceTable records={filteredRecords} searchQuery={searchQuery} setSearchQuery={setSearchQuery} roleFilter={roleFilter} setRoleFilter={setRoleFilter} statusFilter={statusFilter} setStatusFilter={setStatusFilter} /><AnalyticsView records={records} students={students} /></div>}
      {activeTab === 'attendance' && <AttendanceTable records={filteredRecords} searchQuery={searchQuery} setSearchQuery={setSearchQuery} roleFilter={roleFilter} setRoleFilter={setRoleFilter} statusFilter={statusFilter} setStatusFilter={setStatusFilter} />}
      {activeTab === 'students' && <StudentsView students={students} records={records} onOpenAddModal={() => setAddStudentOpen(true)} onDeleteStudent={deleteStudent} />}
      {activeTab === 'absences' && <AbsenceReports absences={absences} onAbsenceAction={absenceAction} />}
      {activeTab === 'analytics' && <AnalyticsView records={records} students={students} />}
      {activeTab === 'settings' && <SettingsView geofenceRadius={geofenceRadius} setGeofenceRadius={setGeofenceRadius} onSave={saveSettings} />}
    </main></div>
    <ManualCheckinModal isOpen={manualOpen} onClose={() => setManualOpen(false)} onAddRecord={addRecord} />
    <AddStudentModal isOpen={addStudentOpen} onClose={() => setAddStudentOpen(false)} onAddStudent={addStudent} onAddBulkStudents={addBulkStudents} />
  </div>
}
