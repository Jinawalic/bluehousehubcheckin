'use client'

import { Clock3, CheckCircle2, ArrowLeft, Send, LogOut } from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'
import { toast } from 'sonner'
import { WeeklyPerformanceCard } from './weekly-performance-card'
import { HubScene } from './hub-scene'

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
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const handleCheckOut = async () => {
    if (!window.confirm('Check out for today? You will not be able to check in again today.')) return
    setIsCheckingOut(true)
    try {
      if (attendanceId) {
        const res = await fetch('/api/check-in', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attendanceId, action: 'checkout' }),
        })
        if (!res.ok) throw new Error()
      }
      toast.success('You have been checked out. See you next time!')
      onBackToHome?.()
    } catch {
      toast.error('Unable to check out right now. Please try again.')
    } finally {
      setIsCheckingOut(false)
    }
  }

  // Auto check-out at 4pm Lagos time
  const lagosHour = Number(
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Lagos', hour: '2-digit', hour12: false }).format(now),
  ) % 24
  useEffect(() => {
    if (lagosHour >= 16) {
      toast.info('It is 4:00 PM, you have been automatically checked out.')
      onBackToHome?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lagosHour >= 16])

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
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#F3F7FC] px-4 py-6 font-sans sm:px-6 sm:py-10">
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-12 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-cyan-200/30 blur-3xl" />
      <div className="relative z-10 w-full max-w-[1080px] space-y-5">
        <header className="flex items-center justify-between gap-3 rounded-2xl border border-white/80 bg-white/75 px-3 py-3 shadow-sm backdrop-blur sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#12336F] to-[#2997A7] shadow-md shadow-blue-900/15">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900 sm:text-base">Bluehouse Hub</p>
              <p className="hidden text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 sm:block">Daily attendance</p>
            </div>
          </div>
          {onBackToHome ? (
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800 transition hover:bg-blue-100"
              aria-label="Back to check-in"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Check-in</span>
            </button>
          ) : <div className="flex-1" />}
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleCheckOut}
              disabled={isCheckingOut}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
              aria-label={isCheckingOut ? 'Checking out' : 'Check out'}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isCheckingOut ? 'Checking out...' : 'Check out'}</span>
            </button>
            <span className="hidden items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700 sm:inline-flex">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified Present
            </span>
          </div>
        </header>

        <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
          <aside className="relative flex min-h-[370px] flex-col overflow-hidden rounded-[28px] bg-gradient-to-br from-[#10295C] via-[#163C7C] to-[#175789] p-6 text-white shadow-[0_24px_70px_-26px_rgba(13,48,105,0.5)] sm:min-h-[440px] sm:rounded-[32px] sm:p-8">
            <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border border-white/10" />
            <div aria-hidden="true" className="pointer-events-none absolute -right-4 -top-5 h-40 w-40 rounded-full border border-white/10" />
            <div className="relative z-10 inline-flex items-center gap-2 self-start rounded-full border border-emerald-200/20 bg-emerald-300/10 px-3 py-1.5 text-[11px] font-bold tracking-wide text-emerald-100">
              <CheckCircle2 className="h-3.5 w-3.5" />
              VERIFIED PRESENT
            </div>
            <div className="relative z-10 mt-5">
              <h1 className="font-serif text-3xl font-black tracking-tight sm:text-[38px]">You&apos;re checked in</h1>
              <p className="mt-2 text-base font-semibold text-blue-50">
                {studentName}
              </p>
              <p className="mt-0.5 text-sm font-medium text-cyan-200">{studentTrack}</p>
              {checkInTime && (
                <p className="mt-1 text-xs text-blue-100/65">Recorded at {checkInTime}</p>
              )}
            </div>
            <div className="relative mx-auto mt-auto w-full max-w-[460px] pt-2">
              <HubScene />
            </div>
            <div className="relative z-10 mt-1 flex items-center gap-2 text-xs font-medium text-blue-100/75">
              <Clock3 className="h-3.5 w-3.5 text-cyan-200" />
              Make today count at Bluehouse
            </div>
          </aside>

          <div className="space-y-5">
            {/* Dynamic Time in Hub */}
            <section className="rounded-[24px] border border-blue-100 bg-white p-5 shadow-[0_16px_45px_-25px_rgba(25,63,121,0.25)] sm:rounded-[28px] sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    {sessionComplete ? 'Session complete' : 'Your hub session'}
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-slate-900">Time left in 5-hour session</h2>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <Clock3 className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-4xl font-black tracking-tight text-slate-900 tabular-nums sm:text-[46px]">
                {formatClock(remainingMs)}
              </div>
              <div
                className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-label="Session elapsed"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress)}
              >
                <div className="h-full rounded-full bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Counting from your check-in{checkInTime ? ` at ${checkInTime}` : ''}. Elapsed {formatClock(Math.min(elapsedMs, SESSION_MS))}.
              </p>
            </section>

            {/* Task Submission Card (Optional) */}
            <section className="rounded-[24px] border border-blue-100 bg-white p-5 shadow-[0_16px_45px_-25px_rgba(25,63,121,0.2)] sm:rounded-[28px] sm:p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900 sm:text-lg">Today&apos;s task submission</h2>
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                        Optional
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Paste the link to your project, repository, or progress report if ready.
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      isSubmitted ? 'border border-emerald-200 bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
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
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
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
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    {onBackToHome && (
                      <button
                        type="button"
                        onClick={onBackToHome}
                        className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:text-sm"
                      >
                        {isSubmitted ? 'Done & Return' : 'Skip & Finish'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#173F85] to-[#268CA5] px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-900/15 transition hover:brightness-105 disabled:opacity-50 sm:text-sm"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{isSubmitting ? 'Saving...' : isSubmitted ? 'Update Submission' : 'Submit Task (Optional)'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Friday Special Card */}
            {isFriday && participantId && (
              <WeeklyPerformanceCard participantId={participantId} refreshKey={reportRefresh} />
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
