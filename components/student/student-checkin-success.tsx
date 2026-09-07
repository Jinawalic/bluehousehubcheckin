'use client'

import { Clock3, Share2, CheckCircle2, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'

interface StudentCheckInSuccessProps {
  studentName?: string
  studentTrack?: string
}

const fridayCard = {
  title: 'Follow & share Techfest Jos on X',
  handle: 'https://x.com/techfestjosh',
  reward: '+20 pts',
  description: 'Follow and repost, then paste the link to your repost as proof.',
}

export function StudentCheckInSuccess({
  studentName = 'Student',
  studentTrack = 'Web Development',
}: StudentCheckInSuccessProps) {
  const [taskLink, setTaskLink] = useState('')
  const [taskReason, setTaskReason] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const isFriday = useMemo(() => new Date().getDay() === 5, [])

  const handleSubmit = () => {
    if (!taskLink.trim() || !taskReason.trim()) {
      return
    }

    setIsSubmitted(true)
  }

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `I just completed the Techfest Jos Friday task. Link: ${fridayCard.handle}`,
    )
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <main className="min-h-screen bg-[#F4EFFB] px-4 py-8">
      <div className="mx-auto max-w-[620px] rounded-[28px] border border-violet-200 bg-white p-5 shadow-[0_18px_55px_-18px_rgba(157,92,240,0.2)] sm:p-7">
        <div className="mb-5 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-700 shadow-inner">
            <Clock3 className="h-7 w-7" />
          </div>
        </div>

        <div className="text-center">
          <h1 className="font-serif text-3xl font-black tracking-tight text-slate-900">You&apos;re checked in</h1>
          <p className="mt-2 text-base text-slate-500">
            {studentName} • {studentTrack}
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Time in the hub</p>
          <div className="mt-3 text-4xl font-black tracking-tight text-slate-900">3h 11m</div>
          <p className="mt-2 text-sm text-slate-500">1h 48m remaining for the full 5-hour session.</p>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Today&apos;s task submission</h2>
              <p className="text-sm text-slate-500">Paste the link to today&apos;s task</p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${isSubmitted ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
              {isSubmitted ? 'Submitted' : 'Not submitted'}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Task link
              </label>
              <input
                value={taskLink}
                onChange={(e) => setTaskLink(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Reason for this task
              </label>
              <textarea
                rows={3}
                value={taskReason}
                onChange={(e) => setTaskReason(e.target.value)}
                placeholder="Explain what this task is about and why it is being done..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
            >
              Submit
            </button>
          </div>
        </div>

        {isFriday && (
          <div className="mt-6 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-fuchsia-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-600" />
                <h3 className="text-base font-bold text-slate-900">{fridayCard.title}</h3>
              </div>
              <span className="rounded-full bg-violet-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-700">
                {fridayCard.reward}
              </span>
            </div>

            <p className="mt-3 text-sm text-slate-600">{fridayCard.description}</p>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                readOnly
                value={fridayCard.handle}
                className="flex-1 rounded-xl border border-violet-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none"
              />
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                <Share2 className="h-4 w-4" />
                Share on WhatsApp
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-dashed border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Check out early (will be flagged)
          </button>
        </div>
      </div>
    </main>
  )
}
