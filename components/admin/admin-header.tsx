'use client'

import React from 'react'
import {
  PlusCircle,
  Download,
  LogOut,
  ShieldCheck,
} from 'lucide-react'
import { AdminTab, AdminUser } from './types'

interface AdminHeaderProps {
  activeTab: AdminTab
  onOpenSidebar: () => void
  onOpenManualModal: () => void
  onExportCSV: () => void
  adminUser: AdminUser | null
  onLogout: () => void
}

const TAB_TITLES: Record<AdminTab, { title: string; subtitle: string }> = {
  overview: {
    title: 'Dashboard Overview',
    subtitle: 'Real-time Blue House Hub operational summary and metrics',
  },
  attendance: {
    title: 'Live Attendance Log',
    subtitle: 'Daily check-in records for students and mentors',
  },
  students: {
    title: 'Participant & Student Roster',
    subtitle: 'Manage registered students and faculty mentors',
  },
  absences: {
    title: 'Absence Requests',
    subtitle: 'Review and approve absence notifications submitted by participants',
  },
  analytics: {
    title: 'Analytics & Participation Trends',
    subtitle: 'Turnout rates, peak check-in distribution, and track breakdown',
  },
  settings: {
    title: 'Hub & Geofence Settings',
    subtitle: 'GPS tolerances, allowable geofence radius, and check-in window parameters',
  },
}

export function AdminHeader({
  activeTab,
  onOpenSidebar,
  onOpenManualModal,
  onExportCSV,
  adminUser,
  onLogout,
}: AdminHeaderProps) {
  const currentTabInfo = TAB_TITLES[activeTab] || TAB_TITLES.overview

  return (
    <header className="relative z-30 px-4 py-4 sm:px-8 sm:py-5 lg:px-12 lg:py-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#8f2bd4] via-[#c342df] to-[#ff6c9b] shadow-[0_8px_20px_rgba(174,76,207,0.24)] shrink-0">
            <ShieldCheck className="h-6 w-6 text-white" strokeWidth={2.4} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-black leading-none text-[#171429] sm:text-[28px]">
                Admin dashboard
              </h1>
              {adminUser?.role && (
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                  {adminUser.role}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs sm:text-sm text-[#6d6a7e]">
              {adminUser ? `${adminUser.name || 'Admin'} (${adminUser.email})` : currentTabInfo.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Action: Export CSV */}
          <button
            type="button"
            onClick={onExportCSV}
            title="Export CSV Roster"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 sm:px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:bg-purple-50 hover:text-purple-700 active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Export CSV</span>
          </button>

          {/* Quick Action: Manual Check-In */}
          <button
            type="button"
            onClick={onOpenManualModal}
            title="Manual Check-in Override"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#7b2bc7] px-3 sm:px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#6821aa] active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Manual Check-in</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-full border border-[#e3e1ed] bg-white/70 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-[#171429] shadow-[0_2px_6px_rgba(72,67,110,0.08)] transition hover:bg-white cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  )
}
