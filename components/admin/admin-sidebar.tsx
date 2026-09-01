'use client'

import React from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  LayoutDashboard,
  UserCheck,
  GraduationCap,
  AlertCircle,
  BarChart3,
  Settings,
  LogOut,
  X,
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
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs lg:hidden transition-opacity animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-purple-100 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-[4px_0_24px_rgba(140,90,200,0.06)] lg:shadow-none`}
      >
        {/* Top Header & Logo */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-3 group select-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#9835EA] via-[#BF25D1] to-[#EB4899] flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
              <ShieldCheck className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div>
              <span className="font-serif font-black text-lg text-slate-900 block leading-tight">
                Bluehouse Hub
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-100">
                Admin Command
              </span>
            </div>
          </Link>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Navigation Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_4px_12px_rgba(140,50,220,0.25)]'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-purple-50/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-slate-500 group-hover:text-purple-600'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.id === 'absences'
                            ? 'bg-rose-500 text-white animate-pulse'
                            : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* User Profile & Logout Bottom Bar */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {adminUser?.avatar || 'BH'}
              </div>
              <div className="truncate text-left">
                <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                  {adminUser?.name || 'Administrator'}
                </p>
                <p className="text-[10px] text-purple-700 font-medium truncate leading-tight">
                  {adminUser?.role || 'Super Admin'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              title="Sign out of Admin Portal"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
