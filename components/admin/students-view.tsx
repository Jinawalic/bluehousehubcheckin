'use client'

import React, { useState, useMemo } from 'react'
import {
  Search,
  GraduationCap,
  Briefcase,
  Flag,
  UserPlus,
  Download,
  Trash2,
  AlertCircle,
  RefreshCw,
  Mail,
  Phone,
  CheckCircle2,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { Student, Role } from './types'

interface StudentsViewProps {
  students: Student[]
  onOpenAddModal: () => void
  onDeleteStudent: (id: string) => void
}

export function StudentsView({
  students,
  onOpenAddModal,
  onDeleteStudent,
}: StudentsViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all')
  const [trackFilter, setTrackFilter] = useState<string>('all')

  // Extract unique tracks
  const uniqueTracks = useMemo(() => {
    const tracks = new Set(students.map((s) => s.track).filter(Boolean))
    return Array.from(tracks)
  }, [students])

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.track.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesRole = roleFilter === 'all' || s.role === roleFilter
      const matchesTrack = trackFilter === 'all' || s.track === trackFilter

      return matchesSearch && matchesRole && matchesTrack
    })
  }, [students, searchQuery, roleFilter, trackFilter])

  // Export Roster CSV
  const handleExportRoster = () => {
    const headers = ['Name', 'Role', 'Identifier', 'Track', 'Email', 'Phone', 'Registered Date', 'Status']
    const rows = filteredStudents.map((s) => [
      `"${s.name}"`,
      `"${s.role}"`,
      `"${s.identifier}"`,
      `"${s.track}"`,
      `"${s.email || ''}"`,
      `"${s.phone || ''}"`,
      `"${s.registeredAt}"`,
      `"${s.status}"`,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `bluehouse-participants-roster-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Roster CSV downloaded')
  }

  const hasActiveFilters = searchQuery !== '' || roleFilter !== 'all' || trackFilter !== 'all'

  return (
    <div className="space-y-4">
      {/* Top Banner with Actions */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif font-bold text-lg sm:text-xl text-slate-900 leading-tight">
              Participant & Student Directory
            </h2>
            <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
              {students.length} Registered
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Manage cohort students, faculty mentors, and NYSC corpers enrolled at Blue House Hub.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={handleExportRoster}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Roster</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Participants</span>
          </button>
        </div>
      </div>

      {/* Search & Filters Toolbar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by participant name, ID (24/...), or email..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 outline-none transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'all' | Role)}
            className="px-3 py-2 bg-slate-50 text-xs font-medium text-slate-700 rounded-xl border border-slate-200 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="mentor">Staff / Mentors (BHS/)</option>
            <option value="corper">NYSC Corpers (PL/)</option>
          </select>

          {/* Track Filter */}
          {uniqueTracks.length > 0 && (
            <select
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 text-xs font-medium text-slate-700 rounded-xl border border-slate-200 outline-none cursor-pointer hover:bg-slate-100 transition-colors max-w-[180px] truncate"
            >
              <option value="all">All Tracks</option>
              {uniqueTracks.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setRoleFilter('all')
                setTrackFilter('all')
              }}
              className="p-2 text-xs font-medium text-slate-500 hover:text-slate-900 bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Reset filters"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Tabular Roster Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Participant</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Identifier</th>
                <th className="py-3.5 px-4 hidden md:table-cell">Track</th>
                <th className="py-3.5 px-4 hidden lg:table-cell">Contact</th>
                <th className="py-3.5 px-4">Enrolled</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">No participants found matching your filters.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-purple-50/30 transition-colors group">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {student.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{student.name}</div>
                          <div className="text-[11px] text-slate-400 md:hidden">{student.track}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          student.role === 'student'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                            : student.role === 'mentor'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        }`}
                      >
                        {student.role === 'student' && <GraduationCap className="w-3 h-3" />}
                        {student.role === 'mentor' && <Briefcase className="w-3 h-3" />}
                        {student.role === 'corper' && <Flag className="w-3 h-3" />}
                        <span className="capitalize">{student.role}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700 text-xs">
                      {student.identifier}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 hidden md:table-cell">{student.track}</td>
                    <td className="py-3.5 px-4 text-slate-500 hidden lg:table-cell text-xs">
                      {student.email ? (
                        <span className="block truncate max-w-[160px]">{student.email}</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs whitespace-nowrap">
                      {student.registeredAt}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteStudent(student.id)
                          toast.success(`Removed ${student.name}`)
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove participant"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
