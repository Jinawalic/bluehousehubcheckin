'use client'

import { Clock3, Share2, CheckCircle2, Sparkles, ArrowLeft, Send } from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'
import { toast } from 'sonner'

interface StudentCheckInSuccessProps {
  attendanceId?: string
  studentName?: string
  studentTrack?: string
  checkInTime?: string
  onBackToHome?: () => void
}

const fridayCard = {
  title: 'Follow & share Techfest Jos on X',
  handle: 'https://x.com/techfestjosh',
  reward: '+20 pts',
  description: 'Follow and repost, then paste the link to your repost as proof.',
}

export function StudentCheckInSuccess({
  attendanceId,
  studentName = 'Student',
  studentTrack = 'Web Development',
  checkInTime,
  onBackToHome,
}: StudentCheckInSuccessProps) {
  const [taskLink, setTaskLink] = useState('')
  const [taskReason, setTaskReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [minutesElapsed, setMinutesElapsed] = useState(0)

  // Live timer for elapsed time since checkin
  useEffect(() => {
    const timer = setInterval(() => {
      setMinutesElapsed((prev) => prev + 1)
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const isFriday = useMemo(() => new Date().getDay() === 5, [])

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
      toast.success('Task details submitted successfully!')
    } catch {
      toast.error('Unable to save task submission right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `I just completed the Techfest Jos Friday task. Link: ${fridayCard.handle}`,
    )
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer')
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Hub Active Session</p>
          <div className="mt-2 text-3xl font-black tracking-tight text-slate-900">
            {minutesElapsed < 60
              ? `${minutesElapsed}m elapsed`
              : `${Math.floor(minutesElapsed / 60)}h ${minutesElapsed % 60}m elapsed`}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Standard learning session: 5 hours. Keep building!
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
        {isFriday && (
          <div className="rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-fuchsia-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-600" />
                <h3 className="text-base font-bold text-slate-900">{fridayCard.title}</h3>
              </div>
              <span className="rounded-full bg-violet-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-700">
                {fridayCard.reward}
              </span>
            </div>

            <p className="mt-2 text-xs sm:text-sm text-slate-600">{fridayCard.description}</p>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                readOnly
                value={fridayCard.handle}
                className="flex-1 rounded-xl border border-violet-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-700 outline-none"
              />
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white transition hover:bg-violet-700 cursor-pointer"
              >
                <Share2 className="h-4 w-4" />
                Share on WhatsApp
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

