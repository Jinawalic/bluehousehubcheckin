'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Share2, Download, Trophy } from 'lucide-react'
import { toast } from 'sonner'

interface WeeklyReport {
  name: string
  track: string
  weekStart: string
  weekEnd: string
  position: number
  totalStudents: number
  daysPresent: number
  onTimeDays: number
  tasksSubmitted: number
  weekDays: number
  attendanceScore: number
  punctualityScore: number
  taskScore: number
  total: number
  weights: { attendance: number; punctuality: number; tasks: number }
}

const W = 1080
const H = 1500
const NAVY = '#0b1f6b'
const BLUE = '#1e3a9f'
const LIGHT = '#dbe6ff'

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`
}

function formatRange(start: string, end: string) {
  const f = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return `${f(start)} – ${f(end)}`
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, size: number, weight = '800') {
  let s = size
  ctx.font = `${weight} ${s}px Arial, sans-serif`
  while (ctx.measureText(text).width > maxWidth && s > 24) {
    s -= 2
    ctx.font = `${weight} ${s}px Arial, sans-serif`
  }
}

function drawCard(canvas: HTMLCanvasElement, r: WeeklyReport, logo: HTMLImageElement | null) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  canvas.width = W
  canvas.height = H

  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, BLUE)
  bg.addColorStop(1, NAVY)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Logo panel
  ctx.fillStyle = '#ffffff'
  roundRect(ctx, 60, 60, W - 120, 330, 40)
  ctx.fill()
  if (logo) {
    const lh = 300
    const lw = (logo.width / logo.height) * lh
    ctx.drawImage(logo, (W - lw) / 2, 75, lw, lh)
  }

  ctx.textAlign = 'center'
  ctx.fillStyle = LIGHT
  ctx.font = '700 34px Arial, sans-serif'
  ctx.fillText(`WEEKLY PERFORMANCE  •  ${formatRange(r.weekStart, r.weekEnd).toUpperCase()}`, W / 2, 465)

  ctx.fillStyle = '#ffffff'
  fitText(ctx, r.name, W - 160, 72, '900')
  ctx.fillText(r.name, W / 2, 550)
  ctx.fillStyle = LIGHT
  fitText(ctx, r.track, W - 160, 38, '600')
  ctx.fillText(r.track, W / 2, 605)

  // Position + total
  ctx.fillStyle = '#ffffff'
  roundRect(ctx, 60, 650, 460, 300, 36)
  ctx.fill()
  roundRect(ctx, 560, 650, 460, 300, 36)
  ctx.fill()

  ctx.fillStyle = BLUE
  ctx.font = '700 30px Arial, sans-serif'
  ctx.fillText('POSITION', 290, 710)
  ctx.fillText('TOTAL SCORE', 790, 710)
  ctx.fillStyle = NAVY
  ctx.font = '900 130px Arial, sans-serif'
  ctx.fillText(ordinal(r.position), 290, 840)
  ctx.fillText(`${r.total}%`, 790, 840)
  ctx.fillStyle = '#64748b'
  ctx.font = '600 28px Arial, sans-serif'
  ctx.fillText(`out of ${r.totalStudents} students`, 290, 900)
  ctx.fillText('out of 100%', 790, 900)

  // Breakdown bars
  const rows = [
    { label: 'Attendance', detail: `${r.daysPresent}/${r.weekDays} days`, score: r.attendanceScore, max: r.weights.attendance },
    { label: 'Punctuality', detail: `${r.onTimeDays}/${r.weekDays} on time`, score: r.punctualityScore, max: r.weights.punctuality },
    { label: 'Tasks', detail: `${r.tasksSubmitted}/${r.weekDays} submitted`, score: r.taskScore, max: r.weights.tasks },
  ]
  rows.forEach((row, i) => {
    const y = 990 + i * 125
    ctx.textAlign = 'left'
    ctx.fillStyle = '#ffffff'
    ctx.font = '800 36px Arial, sans-serif'
    ctx.fillText(row.label, 70, y + 30)
    ctx.fillStyle = LIGHT
    ctx.font = '600 26px Arial, sans-serif'
    ctx.fillText(row.detail, 70, y + 68)
    ctx.textAlign = 'right'
    ctx.fillStyle = '#ffffff'
    ctx.font = '900 36px Arial, sans-serif'
    ctx.fillText(`${row.score}/${row.max}`, W - 70, y + 30)

    ctx.fillStyle = 'rgba(255,255,255,0.22)'
    roundRect(ctx, 480, y + 44, W - 550, 22, 11)
    ctx.fill()
    const pct = row.max ? Math.min(1, row.score / row.max) : 0
    if (pct > 0) {
      ctx.fillStyle = '#ffffff'
      roundRect(ctx, 480, y + 44, Math.max(22, (W - 550) * pct), 22, 11)
      ctx.fill()
    }
  })

  ctx.textAlign = 'center'
  ctx.fillStyle = LIGHT
  ctx.font = '600 28px Arial, sans-serif'
  ctx.fillText('Ranked on attendance, punctuality & task submissions', W / 2, 1420)
}

export function WeeklyPerformanceCard({ participantId, refreshKey = 0 }: { participantId: string; refreshKey?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [report, setReport] = useState<WeeklyReport | null>(null)
  const [error, setError] = useState('')
  const [logo, setLogo] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = new Image()
    img.onload = () => setLogo(img)
    img.src = '/logo.png'
  }, [])

  useEffect(() => {
    if (!participantId) return
    let cancelled = false
    fetch(`/api/weekly-report?participantId=${encodeURIComponent(participantId)}`, { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Unable to load weekly report.')
        if (!cancelled) setReport(data)
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : 'Unable to load weekly report.'))
    return () => {
      cancelled = true
    }
  }, [participantId, refreshKey])

  useEffect(() => {
    if (report && canvasRef.current) drawCard(canvasRef.current, report, logo)
  }, [report, logo])

  const toBlob = useCallback(
    () => new Promise<Blob | null>((resolve) => canvasRef.current?.toBlob(resolve, 'image/png') ?? resolve(null)),
    [],
  )

  const download = async () => {
    const blob = await toBlob()
    if (!blob) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'bluehouse-weekly-performance.png'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const shareWhatsApp = async () => {
    if (!report) return
    const text = `My Bluehouse Hub weekly performance: ${ordinal(report.position)} of ${report.totalStudents} with ${report.total}% 💙`
    const blob = await toBlob()
    if (blob) {
      const file = new File([blob], 'bluehouse-weekly-performance.png', { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], text })
          return
        } catch (e) {
          if (e instanceof DOMException && e.name === 'AbortError') return
        }
      }
    }
    await download()
    toast.info('Card saved. Attach it in the WhatsApp chat that just opened.')
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Trophy className="h-4 w-4 text-blue-700" />
        <h3 className="text-base font-bold text-blue-950">Your weekly performance card</h3>
      </div>
      {error ? (
        <p className="text-xs text-rose-600">{error}</p>
      ) : !report ? (
        <p className="text-xs text-slate-500">Building your card...</p>
      ) : (
        <>
          <canvas ref={canvasRef} className="w-full h-auto rounded-xl border border-blue-200 shadow-sm" />
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={shareWhatsApp}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 cursor-pointer"
            >
              <Share2 className="h-4 w-4" />
              Share on WhatsApp
            </button>
            <button
              type="button"
              onClick={download}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-800 transition hover:bg-blue-50 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Save
            </button>
          </div>
        </>
      )}
    </div>
  )
}
