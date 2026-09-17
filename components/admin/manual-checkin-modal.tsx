'use client'

import React, { useState } from 'react'
import { PlusCircle, X } from 'lucide-react'
import { toast } from 'sonner'
import { AttendanceRecord, Role } from './types'

interface ManualCheckinModalProps {
  isOpen: boolean
  onClose: () => void
  onAddRecord: (record: AttendanceRecord) => void
}

export function ManualCheckinModal({
  isOpen,
  onClose,
  onAddRecord,
}: ManualCheckinModalProps) {
  const [name, setName] = useState('')
  const [role, setRole] = useState<Role>('student')
  const [identifier, setIdentifier] = useState('')
  const [track, setTrack] = useState('Full-Stack Web Dev')

  if (!isOpen) return null

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole)
    if (newRole === 'student') setIdentifier('')
    else if (newRole === 'mentor') setIdentifier('BHS/')
    else if (newRole === 'corper') setIdentifier('PL/')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !identifier.trim()) {
      toast.error('Please enter name and identifier')
      return
    }

    const newRec: AttendanceRecord = {
      id: `att-${Date.now()}`,
      name: name.trim(),
      role,
      identifier: identifier.trim().toUpperCase(),
      track: track.trim() || 'General',
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      distanceMeters: 4,
      status: 'on-time',
      notes: 'Admin manual entry override',
    }

    onAddRecord(newRec)
    toast.success(`Check-in recorded for ${newRec.name}`)
    setName('')
    setIdentifier(role === 'student' ? '' : role === 'mentor' ? 'BHS/' : 'PL/')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-xl text-slate-900 leading-tight">
                Manual Admin Check-in
              </h2>
              <p className="text-slate-500 text-xs">Record attendance override</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Titus Jinawa"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/15 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Role</label>
              <select
                value={role}
                onChange={(e) => handleRoleChange(e.target.value as Role)}
                className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-900 rounded-xl border border-slate-200 outline-none cursor-pointer"
              >
                <option value="student">Student</option>
                <option value="mentor">Staff / Mentor</option>
                <option value="corper">NYSC Corper</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Identifier</label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="24/..."
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-900 rounded-xl border border-slate-200 outline-none uppercase font-mono text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Track / Department</label>
            <input
              type="text"
              value={track}
              onChange={(e) => setTrack(e.target.value)}
              placeholder="e.g. Full-Stack Web Dev"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-900 rounded-xl border border-slate-200 outline-none"
            />
          </div>

          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-semibold shadow-xs hover:opacity-95 transition cursor-pointer"
            >
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
