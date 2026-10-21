'use client'

import { Clock3, CheckCircle2, ArrowLeft, Send } from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'
import { toast } from 'sonner'
import { WeeklyPerformanceCard } from './weekly-performance-card'

interface StudentCheckInSuccessProps {
  attendanceId?: string
  participantId?: string
  studentName?: string
  studentTrack?: string
  checkInTime?: string
  checkedInAt?: string
  onBackToHome?: () => void
}

const SESSION_MS = 5 * 60 * 60 * 1000

function formatClock(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}

export function StudentCheckInSuccess({
  attendanceId,
  participantId,
  studentName = 'Student',
  studentTrack = 'Web Development',
  checkInTime,
  checkedInAt,
  onBackToHome,
}: StudentCheckInSuccessProps) {
  const [taskLink, setTaskLink] = useState('')
  const [taskReason, setTaskReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [reportRefresh, setReportRefresh] = useState(0)

  const startMs = useMemo(() => {
    const parsed = checkedInAt ? Date.parse(checkedInAt) : NaN
    return Number.isNaN(parsed) ? Date.now() : Math.min(parsed, Date.now())
  }, [checkedInAt])
  const [now, setNow] = useState(() => Date.now())

  // Derived from the real check-in timestamp each tick, so it never drifts or resets
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const elapsedMs = Math.max(0, now - startMs)
  const remainingMs = Math.max(0, SESSION_MS - elapsedMs)
  const progress = Math.min(100, (elapsedMs / SESSION_MS) * 100)
  const sessionComplete = remainingMs === 0

  const isFriday = useMemo(
    () => new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Lagos', weekday: 'short' }).format(new Date()) === 'Fri',
    [],
  )

  const handleSubmit = async () => {
    if (!taskLink.trim() && !taskReason.trim()) {
      toast.info('Task submission is optional. You can skip if you have no link yet.')
      return
    }

    setIsSubmitting(true)
    try {
      if (attendanceId) {
        await fetch('/api/check-in', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attendanceId,
            taskLink: taskLink.trim(),
            taskReason: taskReason.trim(),
          }),
        })
      }
      setIsSubmitted(true)
      setReportRefresh((n) => n + 1)
      toast.success('Task details submitted successfully!')
    } catch {
      toast.error('Unable to save task submission right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#F4EFFB] px-4 py-8 flex flex-col justify-center items-center">
      <div className="w-full max-w-[620px] rounded-[28px] border border-violet-200 bg-white p-5 shadow-[0_18px_55px_-18px_rgba(157,92,240,0.2)] sm:p-7 space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          {onBackToHome ? (
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Check-in</span>
            </button>
          ) : <div />}

          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified Present
          </span>
        </div>

        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-700 shadow-inner">
            <Clock3 className="h-7 w-7" />
          </div>
          <h1 className="font-serif text-3xl font-black tracking-tight text-slate-900">You&apos;re checked in</h1>
          <p className="mt-1 text-base font-semibold text-slate-700">
            {studentName} • <span className="text-purple-700">{studentTrack}</span>
          </p>
          {checkInTime && (
            <p className="text-xs text-slate-400 mt-0.5">Recorded at {checkInTime}</p>
          )}
        </div>

        {/* Dynamic Time in Hub */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            {sessionComplete ? 'Session complete' : 'Time left in 5-hour session'}
          </p>
          <div className="mt-2 text-4xl font-black tracking-tight text-slate-900 tabular-nums">
            {formatClock(remainingMs)}
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-violet-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Counting from your check-in{checkInTime ? ` at ${checkInTime}` : ''}. Elapsed {formatClock(Math.min(elapsedMs, SESSION_MS))}.
          </p>
        </div>

        {/* Task Submission Card (Optional) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Today&apos;s task submission</h2>
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  Optional
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Paste the link to your project, repository, or progress report if ready.
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold shrink-0 ${
                isSubmitted ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isSubmitted ? 'Submitted' : 'Not submitted'}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Task link (GitHub, Figma, Notion, Google Doc, etc.)
              </label>
              <input
                value={taskLink}
                onChange={(e) => setTaskLink(e.target.value)}
                placeholder="https://github.com/... or https://..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Summary / Objective (Optional)
              </label>
              <textarea
                rows={2}
                value={taskReason}
                onChange={(e) => setTaskReason(e.target.value)}
                placeholder="What did you build or learn today? (e.g. Completed React authentication module)"
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <div className="flex gap-2 pt-1">
              {onBackToHome && (
                <button
                  type="button"
                  onClick={onBackToHome}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  {isSubmitted ? 'Done & Return' : 'Skip & Finish'}
                </button>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Saving...' : isSubmitted ? 'Update Submission' : 'Submit Task (Optional)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Friday Special Card */}
        {isFriday && participantId && (
          <WeeklyPerformanceCard participantId={participantId} refreshKey={reportRefresh} />
        )}
      </div>
    </main>
  )
}

