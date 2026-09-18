'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  MapPin,
  Clock,
  GraduationCap,
  User,
  AlertCircle,
  Loader2,
  CheckCircle2,
  X,
  Send,
  MessageSquareWarning,
  ShieldCheck,
  Building,
  UserPlus,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  StudentRegistrationModal,
  type StudentRegistrationFormValues,
} from '@/components/student/student-registration-modal'
import { StudentCheckInSuccess } from '@/components/student/student-checkin-success'

const DEFAULT_HUB_SETTINGS = {
  openHour: 9,
  closeHour: 18,
  latitude: 9.88452647721506,
  longitude: 8.876546119960212,
  geofenceRadius: 200,
}

type Role = 'student' | 'mentor'
type StudentRegistrationType = 'private' | 'intern'

interface RoleConfig {
  name: string
  label: string
  prefix: string
  placeholder: string
  hint: string
  example: string
}

const ROLE_CONFIGS: Record<Role, RoleConfig> = {
  student: {
    name: 'Student',
    label: 'Full name or ID',
    prefix: '',
    placeholder: 'e.g. Adaeze Okafor or BHS-2026-0001',
    hint: 'Enter your registered name or ID',
    example: 'Adaeze Okafor',
  },
  mentor: {
    name: 'Staff',
    label: 'Staff ID',
    prefix: 'BHS/',
    placeholder: 'e.g. BHS/24/001',
    hint: 'Prefix: BHS/',
    example: 'BHS/24/001',
  },
}

function lagosMinutesOfDay(epochMs: number) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Lagos',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date(epochMs))
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? '0')
  return get('hour') * 3600 + get('minute') * 60 + get('second')
}

function formatCountdown(seconds: number) {
  const s = Math.max(0, Math.floor(seconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${sec}s` : `${sec}s`
}

function formatHour(hour: number) {
  const period = hour >= 12 ? 'PM' : 'AM'
  const h = hour % 12 || 12
  return `${h}:00 ${period}`
}

export function CheckInForm() {
  const [currentRole, setCurrentRole] = useState<Role>('student')
  const [identifier, setIdentifier] = useState('')
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [isWithinWindow, setIsWithinWindow] = useState(false)
  const [timeStatusText, setTimeStatusText] = useState('Loading check-in hours...')
  const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false)
  const [isMentorsModalOpen, setIsMentorsModalOpen] = useState(false)
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false)

  // Dynamic hub settings loaded from database
  const [hubSettings, setHubSettings] = useState(DEFAULT_HUB_SETTINGS)

  // Absence form state
  const [absenceIdentifier, setAbsenceIdentifier] = useState('')
  const [absenceName, setAbsenceName] = useState('')
  const [absenceRole, setAbsenceRole] = useState<Role>('student')
  const [absenceReason, setAbsenceReason] = useState('')
  const [isSubmittingAbsence, setIsSubmittingAbsence] = useState(false)

  // Load dynamic hub hours & settings from API
  useEffect(() => {
    let isMounted = true
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/check-in')
        if (res.ok) {
          const data = await res.json()
          if (isMounted) {
            setHubSettings({
              openHour: typeof data.openHour === 'number' ? data.openHour : 9,
              closeHour: typeof data.closeHour === 'number' ? data.closeHour : 18,
              latitude: typeof data.latitude === 'number' ? data.latitude : DEFAULT_HUB_SETTINGS.latitude,
              longitude: typeof data.longitude === 'number' ? data.longitude : DEFAULT_HUB_SETTINGS.longitude,
              geofenceRadius: typeof data.geofenceRadius === 'number' ? data.geofenceRadius : DEFAULT_HUB_SETTINGS.geofenceRadius,
            })
          }
        }
      } catch {
        // Fallback remains active
      }
    }
    fetchSettings()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const checkWindow = () => {
      const now = Date.now()
      const secondsOfDay = lagosMinutesOfDay(now)
      const openSeconds = hubSettings.openHour * 3600
      const closeSeconds = hubSettings.closeHour * 3600
      const openTimeLabel = formatHour(hubSettings.openHour)
      const closeTimeLabel = formatHour(hubSettings.closeHour)

      if (secondsOfDay >= openSeconds && secondsOfDay < closeSeconds) {
        setIsWithinWindow(true)
        const remaining = closeSeconds - secondsOfDay
        setTimeStatusText(`Check-in is open (${formatCountdown(remaining)} remaining, closes ${closeTimeLabel}).`)
      } else if (secondsOfDay < openSeconds) {
        setIsWithinWindow(false)
        const untilOpen = openSeconds - secondsOfDay
        setTimeStatusText(`Check-in opens in ${formatCountdown(untilOpen)} (at ${openTimeLabel}).`)
      } else {
        setIsWithinWindow(false)
        setTimeStatusText(`Check-in is closed for today (closes ${closeTimeLabel}).`)
      }
    }

    checkWindow()
    const interval = setInterval(checkWindow, 1000)
    return () => clearInterval(interval)
  }, [hubSettings.openHour, hubSettings.closeHour])

  const handleRoleChange = (newRole: Role) => {
    setCurrentRole(newRole)
    setIdentifier(newRole === 'mentor' ? 'BHS/' : '')
  }

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (currentRole === 'student') {
      setIdentifier(val)
      return
    }
    const prefix = ROLE_CONFIGS[currentRole].prefix
    const rawPrefix = prefix.replace('/', '')

    // If user deleted everything or it doesn't start with prefix, ensure it begins with prefix
    if (!val) {
      setIdentifier(prefix)
      return
    }

    if (val.toUpperCase().startsWith(prefix.toUpperCase())) {
      setIdentifier(val)
    } else if (val.toUpperCase().startsWith(rawPrefix.toUpperCase())) {
      const rest = val.slice(rawPrefix.length).replace(/^[/-]/, '')
      setIdentifier(prefix + rest)
    } else {
      setIdentifier(prefix + val.replace(/^[/-]/, ''))
    }
  }

  const handleAbsenceRoleChange = (newRole: Role) => {
    setAbsenceRole(newRole)
    setAbsenceIdentifier(newRole === 'mentor' ? 'BHS/' : '')
  }

  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [checkedInStudent, setCheckedInStudent] = useState({
    attendanceId: '',
    name: 'Student',
    track: 'Web Development',
    checkInTime: '',
  })

  const handleRegistrationSubmit = async (values: StudentRegistrationFormValues) => {
    const response = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error ?? 'Registration failed.')

    toast.success(`${values.name} registered successfully.`, {
      description: `Student ID: ${result.identifier}. Use your full registered name or ID for daily check-in.`,
    })
  }

  const handleCheckIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    const prefix = ROLE_CONFIGS[currentRole].prefix
    const trimmed = identifier.trim()

    if (!trimmed || (currentRole === 'mentor' && trimmed.toUpperCase() === prefix.toUpperCase())) {
      toast.error(`Please enter your ${ROLE_CONFIGS[currentRole].label}.`, {
        description: `Format example: ${ROLE_CONFIGS[currentRole].example}`,
      })
      return
    }

    setIsCheckingIn(true)

    try {
      const coordinates = await new Promise<GeolocationCoordinates | null>((resolve) => {
        if (!navigator.geolocation) return resolve(null)
        navigator.geolocation.getCurrentPosition(
          (position) => resolve(position.coords),
          () => resolve(null),
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
        )
      })
      const response = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: trimmed,
          name: currentRole === 'student' ? trimmed : undefined,
          role: currentRole,
          latitude: coordinates?.latitude,
          longitude: coordinates?.longitude,
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'Check-in failed.')

      // Staff (mentors) must not submit work; return directly to check-in page with confirmation
      if (currentRole === 'mentor' || result.role === 'mentor') {
        toast.success(`Check-in successful! Verified ${result.name}.`, {
          description: `Staff attendance recorded at ${result.checkInTime}. Have a productive day!`,
        })
        setIdentifier(ROLE_CONFIGS.mentor.prefix)
        setIsCheckingIn(false)
        return
      }

      // Students navigate to optional task submission screen
      setCheckedInStudent({
        attendanceId: result.id || '',
        name: result.name,
        track: result.track || 'Hub Student',
        checkInTime: result.checkInTime || '',
      })
      setIsCheckedIn(true)
      toast.success(`Check-in successful! Verified ${result.name}.`, {
        description: `Track: ${result.track} • Time: ${result.checkInTime}`,
      })
      setIdentifier('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit check-in. Please try again.')
    } finally {
      setIsCheckingIn(false)
    }
  }

  const handleAbsenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const prefix = ROLE_CONFIGS[absenceRole].prefix
    if (!absenceName.trim() || (absenceRole === 'mentor' && (!absenceIdentifier.trim() || absenceIdentifier.trim() === prefix)) || !absenceReason.trim()) {
      toast.error('Please fill in all required fields.')
      return
    }

    setIsSubmittingAbsence(true)
    try {
      const response = await fetch('/api/absence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: absenceName,
          identifier: absenceIdentifier,
          role: absenceRole,
          reason: absenceReason,
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'Absence submission failed.')
      toast.success('Absence report submitted successfully.', {
        description: `Logged for ${absenceName}.`,
      })
      setAbsenceName('')
      setAbsenceIdentifier(absenceRole === 'mentor' ? prefix : '')
      setAbsenceReason('')
      setIsAbsenceModalOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit absence report.')
    } finally {
      setIsSubmittingAbsence(false)
    }
  }

  const currentConfig = ROLE_CONFIGS[currentRole]

  if (isCheckedIn) {
    return (
      <StudentCheckInSuccess
        attendanceId={checkedInStudent.attendanceId}
        studentName={checkedInStudent.name}
        studentTrack={checkedInStudent.track}
        checkInTime={checkedInStudent.checkInTime}
        onBackToHome={() => setIsCheckedIn(false)}
      />
    )
  }

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center px-4 py-8 sm:py-12 overflow-hidden bg-[#F4EFFB] selection:bg-purple-200 selection:text-purple-900 font-sans">
      {/* Ambient background soft glow orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-purple-200/50 via-pink-100/30 to-transparent blur-3xl rounded-full"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-purple-200/40 blur-3xl rounded-full"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 -left-24 w-[350px] h-[350px] bg-pink-200/30 blur-3xl rounded-full"
      />

      <div className="relative z-10 w-full max-w-[580px] flex flex-col items-center">
        {/* Top Header Bar */}
        <header className="w-full flex items-center justify-between gap-2 mb-6 sm:mb-9 px-1 sm:px-2">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5 sm:gap-3 select-none shrink-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-[14px] bg-gradient-to-tr from-[#9835EA] via-[#BF25D1] to-[#EB4899] flex items-center justify-center shadow-[0_4px_14px_rgba(180,50,220,0.3)] transition-transform hover:scale-105">
              <ShieldCheck className="w-4.5 h-4.5 sm:w-6 sm:h-6 text-white stroke-[2.2]" />
            </div>
            <span className="font-serif font-black text-lg sm:text-[22px] tracking-tight text-slate-900">
              Hub Attendance
            </span>
          </div>

          {/* Right Header Navigation Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                handleRoleChange('mentor')
                setIsMentorsModalOpen(true)
              }}
              className="group flex items-center gap-1 sm:gap-1.5 text-slate-600 hover:text-slate-950 font-medium text-xs sm:text-sm px-1.5 sm:px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 group-hover:text-slate-800 transition-colors" />
              <span>Mentors</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAbsenceModalOpen(true)}
              className="flex items-center gap-1 sm:gap-1.5 bg-white/80 hover:bg-white text-slate-800 border border-slate-200/80 hover:border-slate-300 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <MessageSquareWarning className="w-3.5 h-3.5 text-slate-700 stroke-[2.2]" />
              <span>Report absence</span>
            </button>
          </div>
        </header>

        {/* Main Check-in Card */}
        <section className="w-full bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-10 md:p-11 shadow-[0_20px_60px_-15px_rgba(130,90,200,0.09),0_1px_3px_rgba(0,0,0,0.02)] border border-white/90 transition-all">
          {/* Card Header Title & Subtitle */}
          <div className="mb-6 sm:mb-7">
            <h1 className="font-serif font-black text-[32px] sm:text-[38px] md:text-[40px] text-slate-950 tracking-tight leading-[1.15] mb-2.5">
              Daily check-in
            </h1>
            <p className="text-slate-500 text-sm sm:text-[15px] font-normal leading-relaxed">
              Enter your {currentConfig.label.toLowerCase()} exactly as registered. One check-in per device per day.
            </p>
          </div>

          {/* Role Switcher Tabs */}
          <div className="flex items-center justify-between gap-2 mb-4 sm:mb-5">
            <p className="text-xs sm:text-sm text-slate-600 font-medium">New student? Register here</p>
            <button
              type="button"
              onClick={() => setIsRegistrationModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-purple-700 hover:bg-purple-100 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Register student
            </button>
          </div>

          <div
            role="tablist"
            aria-label="Select role"
            className="bg-[#F1EFF7] p-1.5 rounded-2xl flex items-center gap-1 mb-6 sm:mb-7"
          >
            {/* Student */}
            <button
              type="button"
              role="tab"
              aria-selected={currentRole === 'student'}
              onClick={() => handleRoleChange('student')}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer select-none ${currentRole === 'student'
                ? 'bg-white text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
                : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
            >
              <User className="w-4 h-4 stroke-[2.2]" />
              <span>Student</span>
            </button>

            {/* Mentor / Staff */}
            <button
              type="button"
              role="tab"
              aria-selected={currentRole === 'mentor'}
              onClick={() => handleRoleChange('mentor')}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer select-none ${currentRole === 'mentor'
                ? 'bg-white text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
                : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
            >
              <GraduationCap className="w-4 h-4 stroke-[2.2]" />
              <span>Mentor</span>
            </button>

          </div>

          {/* Form Content */}
          <form onSubmit={handleCheckIn} className="space-y-5 sm:space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="identifier-input"
                  className="block text-slate-900 font-semibold text-xs sm:text-sm"
                >
                  {currentConfig.label} (as registered)
                </label>
                <span className="text-[11px] font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                  {currentConfig.hint}
                </span>
              </div>
              <div className="relative flex items-center">
                <input
                  id="identifier-input"
                  type="text"
                  value={identifier}
                  onChange={handleIdentifierChange}
                  placeholder={currentConfig.placeholder}
                  autoCapitalize={currentRole === 'mentor' ? 'characters' : 'words'}
                  autoComplete="off"
                  spellCheck="false"
                  className="w-full rounded-2xl border border-[#E2DFE9] bg-white px-4 py-3 sm:py-3.5 text-slate-900 placeholder:text-slate-400 font-medium tracking-wide text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                />
              </div>
            </div>

            {/* Check-in Now Button with Gradient */}
            <button
              type="submit"
              disabled={isCheckingIn}
              className="w-full bg-gradient-to-r from-[#9C75F7] via-[#E673B8] to-[#FDA98F] hover:brightness-105 active:scale-[0.99] text-white font-medium text-sm sm:text-base py-3.5 sm:py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-[0_10px_25px_-5px_rgba(230,115,184,0.35)] transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed disabled:transform-none select-none"
            >
              {isCheckingIn ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  <span>Verifying & checking in...</span>
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                  <span>Check in now</span>
                </>
              )}
            </button>

            {/* Status Text (Clock Alert matching design) */}
            <div className="pt-1 flex items-center justify-center gap-1.5 text-center">
              <Clock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 stroke-[2.2] ${isWithinWindow ? 'text-emerald-600' : 'text-red-500'}`} />
              <span className={`text-xs sm:text-[13px] font-medium leading-tight ${isWithinWindow ? 'text-emerald-700' : 'text-red-500'}`}>
                {timeStatusText}
              </span>
            </div>
          </form>
        </section>
      </div>

      <StudentRegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        onSubmit={handleRegistrationSubmit}
      />

      {/* Report Absence Modal */}
      {isAbsenceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                  <MessageSquareWarning className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-xl text-slate-900 leading-tight">Report absence</h2>
                  <p className="text-slate-500 text-xs">Notify hub administrators in advance</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAbsenceModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAbsenceSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-800 font-medium text-xs sm:text-sm mb-1.5">
                  Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['student', 'mentor'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleAbsenceRoleChange(r)}
                      className={`py-2 px-2 text-xs font-semibold rounded-lg capitalize border transition ${absenceRole === r
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                      {ROLE_CONFIGS[r].name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-800 font-medium text-xs sm:text-sm mb-1.5">
                  Full name
                </label>
                <input
                  type="text"
                  value={absenceName}
                  onChange={(e) => setAbsenceName(e.target.value)}
                  placeholder="e.g. Titus Jinawa"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
                />
              </div>

              {absenceRole === 'mentor' && <div>
                <label className="block text-slate-800 font-medium text-xs sm:text-sm mb-1.5">
                  {ROLE_CONFIGS[absenceRole].label}
                </label>
                <input
                  type="text"
                  value={absenceIdentifier}
                  onChange={(e) => {
                    let val = e.target.value.toUpperCase()
                    const prefix = ROLE_CONFIGS[absenceRole].prefix
                    if (!val) {
                      setAbsenceIdentifier(prefix)
                    } else if (val.startsWith(prefix)) {
                      setAbsenceIdentifier(val)
                    } else {
                      setAbsenceIdentifier(prefix + val.replace(/^[/-]/, ''))
                    }
                  }}
                  placeholder={ROLE_CONFIGS[absenceRole].placeholder}
                  required={absenceRole === 'mentor'}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
                />
              </div>}

              <div>
                <label className="block text-slate-800 font-medium text-xs sm:text-sm mb-1.5">
                  Reason for absence
                </label>
                <textarea
                  rows={3}
                  value={absenceReason}
                  onChange={(e) => setAbsenceReason(e.target.value)}
                  placeholder="State the reason for your absence (e.g. medical, exam, official assignment)..."
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAbsenceModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAbsence}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium shadow-sm hover:opacity-95 transition disabled:opacity-75 flex items-center justify-center gap-1.5"
                >
                  {isSubmittingAbsence ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mentors Modal */}
      {isMentorsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-xl text-slate-900 leading-tight">Mentor / Staff Portal</h2>
                  <p className="text-slate-500 text-xs">Assigned track mentors and facilitators</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMentorsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#F8F6FC] rounded-2xl p-4 mb-4 text-xs text-slate-600 space-y-1.5">
              <div className="flex items-center gap-2 font-medium text-slate-900">
                <Building className="w-4 h-4 text-purple-600" />
                <span>Bluehouse Hub Faculty & Staff</span>
              </div>
              <p>
                Staff and mentors check in using their <strong>Staff ID</strong> (starting with prefix <strong>BHS/</strong>). Geolocation verification is active.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                handleRoleChange('mentor')
                setIsMentorsModalOpen(false)
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium shadow-sm hover:opacity-95 transition"
            >
              Continue with Staff ID
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
