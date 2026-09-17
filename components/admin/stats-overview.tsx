'use client'

import React from 'react'
import {
  Users,
  GraduationCap,
  Briefcase,
  AlertCircle,
  TrendingUp,
  ChevronRight,
} from 'lucide-react'
import { AdminTab } from './types'

interface StatsOverviewProps {
  stats: {
    total: number
    students: number
    staff: number
    pendingAbsences: number
    onTimeRate: number
  }
  onNavigateTab: (tab: AdminTab) => void
}

export function StatsOverview({ stats, onNavigateTab }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {/* Total Checked In */}
      <div
        onClick={() => onNavigateTab('attendance')}
        className="bg-white p-4 sm:p-5 rounded-2xl border border-purple-100/80 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-purple-200 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 group-hover:text-purple-700 transition-colors">
            Total Check-ins
          </span>
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center transition-transform group-hover:scale-110">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{stats.total}</div>
          <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>{stats.onTimeRate}% on-time</span>
          </p>
        </div>
      </div>

      {/* Students */}
      <div
        onClick={() => onNavigateTab('attendance')}
        className="bg-white p-4 sm:p-5 rounded-2xl border border-purple-100/80 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 group-hover:text-blue-700 transition-colors">
            Students
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center transition-transform group-hover:scale-110">
            <GraduationCap className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{stats.students}</div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">Name-based check-in</p>
        </div>
      </div>

      {/* Staff / Mentors */}
      <div
        onClick={() => onNavigateTab('attendance')}
        className="bg-white p-4 sm:p-5 rounded-2xl border border-purple-100/80 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-amber-200 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 group-hover:text-amber-700 transition-colors">
            Staff / Mentors
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center transition-transform group-hover:scale-110">
            <Briefcase className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{stats.staff}</div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">BHS/ Faculty IDs</p>
        </div>
      </div>

      {/* Pending Absences */}
      <div
        onClick={() => onNavigateTab('absences')}
        className="col-span-2 sm:col-span-1 bg-white p-4 sm:p-5 rounded-2xl border border-purple-100/80 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-rose-200 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 group-hover:text-rose-700 transition-colors">
            Absence Requests
          </span>
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center transition-transform group-hover:scale-110">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {stats.pendingAbsences}
          </div>
          <span className="text-xs font-semibold text-purple-600 group-hover:text-purple-800 flex items-center gap-0.5">
            <span>Review</span>
            <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </div>
  )
}
