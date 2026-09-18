'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { PlusCircle, X, Search, Check, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { AttendanceRecord, AttendanceStatus, Role, Student, STANDARD_TRACKS } from './types'

interface ManualCheckinModalProps {
  isOpen: boolean
  onClose: () => void
  onAddRecord: (record: AttendanceRecord) => void
  students?: Student[]
}

export function ManualCheckinModal({
  isOpen,
  onClose,
  onAddRecord,
  students = [],
}: ManualCheckinModalProps) {
  const [name, setName] = useState('')
  const [role, setRole] = useState<Role>('student')
  const [identifier, setIdentifier] = useState('')
  const [track, setTrack] = useState('Full-Stack Web Development')
  const [status, setStatus] = useState<AttendanceStatus>('on-time')
  const [participantId, setParticipantId] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Collect unique available tracks from students + standard tracks
  const availableTracks = useMemo(() => {
    const set = new Set<string>(STANDARD_TRACKS)
    students.forEach((s) => {
      if (s.track && s.track.trim()) set.add(s.track.trim())
    })
    return Array.from(set)
  }, [students])

  // Filter student suggestions as admin types
  const suggestions = useMemo(() => {
    if (!name.trim() || name.length < 2) return []
    const query = name.toLowerCase()
    return students
      .filter((s) => s.name.toLowerCase().includes(query) || s.identifier.toLowerCase().includes(query))
      .slice(0, 5)
  }, [name, students])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!isOpen) return null

  const handleSelectStudent = (student: Student) => {
    setName(student.name)
    setRole(student.role)
    setIdentifier(student.identifier)
    setTrack(student.track || 'General')
    setParticipantId(student.id)
    setShowSuggestions(false)
  }

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole)
    setParticipantId(null)
    if (newRole === 'student') {
      setIdentifier(name.trim() ? name.trim() : '')
    } else {
      setIdentifier(identifier.startsWith('BHS/') ? identifier : 'BHS/')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    const trimmedIdentifier = (role === 'student' ? (identifier.trim() || trimmedName) : identifier.trim()).toUpperCase()

    if (!trimmedName || (role === 'mentor' && !trimmedIdentifier)) {
      toast.error('Please enter name and identifier')
      return
    }

    const newRec: AttendanceRecord = {
      id: `att-${Date.now()}`,
      participantId: participantId || undefined,
      name: trimmedName,
      role,
      identifier: role === 'student' ? trimmedIdentifier : trimmedIdentifier,
      track: track.trim() || 'General',
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      distanceMeters: 0,
      status,
      notes: 'Admin manual entry override',
    }

    onAddRecord(newRec)
    setName('')
    setIdentifier('')
    setParticipantId(null)
    setStatus('on-time')
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
          {/* Full Name with Autocomplete */}
          <div className="space-y-1.5 relative" ref={wrapperRef}>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">Full Name</label>
              {participantId && (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                  <UserCheck className="w-3 h-3" />
                  Linked to Participant
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setParticipantId(null)
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="e.g. Titus Jinawa"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/15 outline-none transition-all"
              />
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-slate-200 divide-y divide-slate-100 z-50 overflow-hidden">
                <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Registered Participants
                </div>
                {suggestions.map((student) => (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => handleSelectStudent(student)}
                    className="w-full text-left px-3.5 py-2 hover:bg-purple-50 flex items-center justify-between gap-2 transition cursor-pointer"
                  >
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block">{student.name}</span>
                      <span className="text-[10px] text-slate-500">{student.track}</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                      {student.identifier}
                    </span>
                  </button>
                ))}
              </div>
            )}
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
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Identifier</label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={role === 'student' ? 'Uses full name' : 'BHS/...'}
                required={role === 'mentor'}
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-900 rounded-xl border border-slate-200 outline-none uppercase font-mono text-xs"
              />
            </div>
          </div>

          {/* Track / Department */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Track / Department</label>
            <div className="relative">
              <input
                type="text"
                list="track-options-list"
                value={track}
                onChange={(e) => setTrack(e.target.value)}
                placeholder="e.g. Full-Stack Web Development"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-900 rounded-xl border border-slate-200 outline-none"
              />
              <datalist id="track-options-list">
                {availableTracks.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Attendance Status */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Status</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('on-time')}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  status === 'on-time'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                On-Time
              </button>
              <button
                type="button"
                onClick={() => setStatus('late')}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  status === 'late'
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Late
              </button>
              <button
                type="button"
                onClick={() => setStatus('excused')}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  status === 'excused'
                    ? 'bg-purple-50 border-purple-300 text-purple-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Excused
              </button>
            </div>
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

