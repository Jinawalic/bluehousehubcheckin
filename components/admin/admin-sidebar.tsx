'use client'

import React from 'react'
import {
  LayoutDashboard,
  UserCheck,
  GraduationCap,
  AlertCircle,
  BarChart3,
  Settings,
} from 'lucide-react'
import { AdminTab, AdminUser } from './types'

interface AdminSidebarProps {
  activeTab: AdminTab
  setActiveTab: (tab: AdminTab) => void
  pendingAbsencesCount: number
  totalAttendanceCount: number
  totalStudentsCount?: number
  adminUser: AdminUser | null
  onLogout: () => void
  isOpen: boolean
  onClose: () => void
}

export function AdminSidebar({
  activeTab,
  setActiveTab,
  pendingAbsencesCount,
  totalAttendanceCount,
  totalStudentsCount,
  adminUser,
  onLogout,
  isOpen,
  onClose,
}: AdminSidebarProps) {
  const navItems: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string | number }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'attendance',
      label: 'Live Attendance',
      icon: UserCheck,
      badge: totalAttendanceCount > 0 ? totalAttendanceCount : undefined,
    },
    {
      id: 'students',
      label: 'View Students',
      icon: GraduationCap,
      badge: totalStudentsCount !== undefined && totalStudentsCount > 0 ? totalStudentsCount : undefined,
    },
    {
      id: 'absences',
      label: 'Absence Requests',
      icon: AlertCircle,
      badge: pendingAbsencesCount > 0 ? pendingAbsencesCount : undefined,
    },
    {
      id: 'analytics',
      label: 'Analytics & Trends',
      icon: BarChart3,
    },
    {
      id: 'settings',
      label: 'Hub & Geofence',
      icon: Settings,
    },
  ]

  const handleNavClick = (tab: AdminTab) => {
    setActiveTab(tab)
    if (window.innerWidth < 1024) {
      onClose()
    }
  }

  return (
    <nav className="relative z-20 mx-3 rounded-[26px] border border-white/70 bg-[#f0eff9]/90 px-3 py-2 shadow-[0_10px_30px_rgba(93,84,140,0.05)] backdrop-blur-md sm:mx-6 lg:mx-12">
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`inline-flex min-h-10 items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-all cursor-pointer group ${
                isActive
                  ? 'bg-white text-slate-950 shadow-[0_2px_6px_rgba(72,67,110,0.12)]'
                  : 'text-[#66647d] hover:bg-white/70 hover:text-slate-950'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-slate-900' : 'text-[#66647d] group-hover:text-slate-900'}`} />
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${item.id === 'absences' ? 'bg-rose-500 text-white' : 'bg-purple-100 text-purple-800'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
