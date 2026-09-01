'use client'

import React from 'react'
import {
  Menu,
  PlusCircle,
  Download,
} from 'lucide-react'
import { AdminTab, AdminUser } from './types'

interface AdminHeaderProps {
  activeTab: AdminTab
  onOpenSidebar: () => void
  onOpenManualModal: () => void
  onExportCSV: () => void
  adminUser: AdminUser | null
}

const TAB_TITLES: Record<AdminTab, { title: string; subtitle: string }> = {
  overview: {
    title: 'Dashboard Overview',
    subtitle: 'Real-time Blue House Hub operational summary and metrics',
  },
  attendance: {
    title: 'Live Attendance Log',
    subtitle: 'Daily check-in records for students, mentors, and corpers',
  },
  students: {
    title: 'Participant & Student Roster',
    subtitle: 'Manage registered students, faculty staff, and NYSC corpers',
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
}: AdminHeaderProps) {
  const currentTabInfo = TAB_TITLES[activeTab] || TAB_TITLES.overview

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-purple-100/80 px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Tab Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-colors cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="font-serif font-black text-lg sm:text-xl text-slate-900 leading-tight">
              {currentTabInfo.title}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block">
              {currentTabInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Action: Export CSV */}
          <button
            type="button"
            onClick={onExportCSV}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 text-xs font-semibold px-3 py-2 rounded-xl transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Quick Action: Manual Check-In */}
          <button
            type="button"
            onClick={onOpenManualModal}
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Manual Entry</span>
          </button>
        </div>
      </div>
    </header>
  )
}
