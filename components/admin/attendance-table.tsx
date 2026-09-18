'use client'

import React from 'react'
import {
  Search,
  GraduationCap,
  Briefcase,
  MapPin,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { AttendanceRecord, AttendanceStatus, Role } from './types'

interface AttendanceTableProps {
  records: AttendanceRecord[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  roleFilter: 'all' | Role
  setRoleFilter: (role: 'all' | Role) => void
  statusFilter: 'all' | AttendanceStatus
  setStatusFilter: (status: 'all' | AttendanceStatus) => void
  onDeleteRecord?: (id: string) => Promise<void>
}

export function AttendanceTable({
  records,
  searchQuery,
  setSearchQuery,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  onDeleteRecord,
}: AttendanceTableProps) {
  const hasActiveFilters = searchQuery !== '' || roleFilter !== 'all' || statusFilter !== 'all'

  const handleClearFilters = () => {
    setSearchQuery('')
    setRoleFilter('all')
    setStatusFilter('all')
  }

  const handleDelete = async (record: AttendanceRecord) => {
    if (!onDeleteRecord) return
    const confirmed = window.confirm(`Remove check-in record for ${record.name} (${record.checkInTime})?`)
    if (confirmed) {
      await onDeleteRecord(record.id)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search & Filters Toolbar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by participant name, ID (24/...), or track..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 outline-none transition-all"
          />
        </div>

        {/* Filters Group */}
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
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | AttendanceStatus)}
            className="px-3 py-2 bg-slate-50 text-xs font-medium text-slate-700 rounded-xl border border-slate-200 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="on-time">On-Time</option>
            <option value="late">Late Arrival</option>
            <option value="excused">Excused / Override</option>
          </select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="p-2 text-xs font-medium text-slate-500 hover:text-slate-900 bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Reset all filters"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Participant</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Identifier</th>
                <th className="py-3.5 px-4 hidden md:table-cell">Track</th>
                <th className="py-3.5 px-4">Time & Date</th>
                <th className="py-3.5 px-4">GPS Verification</th>
                <th className="py-3.5 px-4">Status</th>
                {onDeleteRecord && <th className="py-3.5 px-4 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={onDeleteRecord ? 8 : 7} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">No check-in records found matching your filters.</p>
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-semibold text-slate-900">{record.name}</div>
                      <div className="text-[11px] text-slate-400 md:hidden">{record.track}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          record.role === 'student'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                            : record.role === 'mentor'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        }`}
                      >
                        {record.role === 'student' && <GraduationCap className="w-3 h-3" />}
                        {record.role === 'mentor' && <Briefcase className="w-3 h-3" />}
                        <span className="capitalize">{record.role}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700 text-xs">
                      {record.identifier}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 hidden md:table-cell">{record.track}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                      <div>{record.checkInTime}</div>
                      {record.date && (
                        <div className="text-[10px] text-slate-400 font-normal">{record.date}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50">
                        <MapPin className="w-3 h-3" />
                        <span>{record.distanceMeters}m from Hub</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          record.status === 'on-time'
                            ? 'bg-emerald-100 text-emerald-800'
                            : record.status === 'late'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {record.status === 'on-time' && <CheckCircle2 className="w-3 h-3" />}
                        {record.status === 'late' && <Clock className="w-3 h-3" />}
                        {record.status === 'excused' && <ShieldCheck className="w-3 h-3" />}
                        <span className="capitalize">{record.status}</span>
                      </span>
                    </td>
                    {onDeleteRecord && (
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(record)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Delete check-in record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
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
