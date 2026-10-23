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
  schedule?: string
  attendanceScore: number
  punctualityScore: number
  taskScore: number
  total: number
  weights: { attendance: number; punctuality: number; tasks: number }
}

const W = 1080
const H = 1620
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

const HUB_SHAPES: { d: string; fill: string }[] = [
  { d: 'm83 278 178-91 220 92-180 94-218-95Z', fill: '#bcd8f8' },
  { d: 'm83 278 218 95v14L83 292v-14Z', fill: '#7ea9df' },
  { d: 'm301 373 180-94v14l-180 94v-14Z', fill: '#5c88c2' },
  { d: 'm176 155 105-55 132 57-107 57-130-59Z', fill: '#91b5e5' },
  { d: 'm176 155 130 59v128l-130-59V155Z', fill: '#eaf2ff' },
  { d: 'm306 214 107-57v128l-107 57V214Z', fill: '#9bbbea' },
  { d: 'm162 151 119-64 145 63-119 65-145-64Z', fill: '#f7fbff' },
  { d: 'm162 151 145 64v18l-145-65v-17Z', fill: '#bdd6f4' },
  { d: 'm307 215 119-65v18l-119 65v-18Z', fill: '#8db3e3' },
  { d: 'm190 170 31 14v31l-31-14v-31Z', fill: '#7cc7e9' },
  { d: 'm234 189 31 14v31l-31-14v-31Z', fill: '#7cc7e9' },
  { d: 'm190 222 31 14v31l-31-14v-31Z', fill: '#7cc7e9' },
  { d: 'm234 241 31 14v31l-31-14v-31Z', fill: '#7cc7e9' },
  { d: 'm323 226 28-15v30l-28 15v-30Z', fill: '#4e77af' },
  { d: 'm366 203 28-15v30l-28 15v-30Z', fill: '#4e77af' },
  { d: 'm323 269 28-15v16l-28 15v-16Z', fill: '#4e77af' },
  { d: 'm366 246 28-15v16l-28 15v-16Z', fill: '#4e77af' },
  { d: 'm269 278 36 17v57l-36-17v-57Z', fill: '#17376f' },
  { d: 'm305 295 37-19v57l-37 19v-57Z', fill: '#315b98' },
  { d: 'm259 272 47 22 48-25-47-22-48 25Z', fill: '#ffffff' },
  { d: 'm132 271 14-7 14 7v35l-14 8-14-8v-35Z', fill: '#277b69' },
  { d: 'M145 274c-19-13-12-33 1-41 11 13 12 29-1 41Z', fill: '#58b99a' },
  { d: 'M147 274c3-19 17-24 28-19-2 17-12 24-28 19Z', fill: '#7dd2ac' },
  { d: 'm421 279 12-6 12 6v28l-12 7-12-7v-28Z', fill: '#277b69' },
  { d: 'M432 282c-15-11-9-26 1-33 9 10 9 23-1 33Z', fill: '#58b99a' },
  { d: 'M434 282c3-15 14-19 23-15-2 13-10 19-23 15Z', fill: '#7dd2ac' },
  { d: 'M347 46c-17 0-30 13-30 29 0 22 30 47 30 47s30-25 30-47c0-16-13-29-30-29Z', fill: '#57d3be' },
]

function drawHubScene(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  ctx.save()
  ctx.shadowColor = 'rgba(2,10,40,0.55)'
  ctx.shadowBlur = 36
  ctx.shadowOffsetY = 18
  ctx.fillStyle = '#bcd8f8'
  ctx.fill(new Path2D(HUB_SHAPES[0].d))
  ctx.restore()
  for (const shape of HUB_SHAPES) {
    ctx.fillStyle = shape.fill
    ctx.fill(new Path2D(shape.d))
  }
  ctx.fillStyle = '#f6fffe'
  ctx.beginPath()
  ctx.arc(347, 75, 11, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#138d7d'
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.stroke(new Path2D('m342 75 4 4 7-8'))
  ctx.restore()
}

function drawCard(canvas: HTMLCanvasElement, r: WeeklyReport, logo: HTMLImageElement | null) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  canvas.width = W
  canvas.height = H

  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#173F85')
  bg.addColorStop(0.55, '#10295C')
  bg.addColorStop(1, '#0a1c45')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  const glow = ctx.createRadialGradient(W / 2, 430, 20, W / 2, 430, 560)
  glow.addColorStop(0, 'rgba(87,187,208,0.38)')
  glow.addColorStop(1, 'rgba(87,187,208,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = 'rgba(255,255,255,0.07)'
  ctx.lineWidth = 2
  for (const radius of [330, 470, 610]) {
    ctx.beginPath()
    ctx.arc(W - 40, 80, radius, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Logo chip
  ctx.save()
  roundRect(ctx, W / 2 - 220, 36, 440, 132, 66)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.clip()
  if (logo) {
    const lh = 200
    const lw = (logo.width / logo.height) * lh
    ctx.drawImage(logo, (W - lw) / 2, 36 + (132 - lh) / 2 - 4, lw, lh)
  }
  ctx.restore()

  ctx.textAlign = 'center'
  ctx.fillStyle = '#7dd3fc'
  ctx.font = '800 30px Arial, sans-serif'
  ctx.fillText(`WEEKLY PERFORMANCE  •  ${formatRange(r.weekStart, r.weekEnd).toUpperCase()}`, W / 2, 214)

  drawHubScene(ctx, 246, 225, 1.05)

  ctx.fillStyle = '#ffffff'
  fitText(ctx, r.name, W - 160, 72, '900')
  ctx.fillText(r.name, W / 2, 715)
  ctx.fillStyle = '#7dd3fc'
  fitText(ctx, r.track, W - 160, 38, '700')
  ctx.fillText(r.track, W / 2, 765)
  if (r.schedule) {
    ctx.fillStyle = LIGHT
    ctx.font = '600 28px Arial, sans-serif'
    ctx.fillText(`Hub days: ${r.schedule}`, W / 2, 808)
  }

  // Raised position and score tiles
  const tileY = 850
  const tileH = 280
  for (const x of [60, 560]) {
    ctx.save()
    ctx.shadowColor = 'rgba(4,14,50,0.5)'
    ctx.shadowBlur = 30
    ctx.shadowOffsetY = 20
    ctx.fillStyle = '#8fb0e6'
    roundRect(ctx, x, tileY + 14, 460, tileH, 36)
    ctx.fill()
    ctx.restore()
    ctx.fillStyle = '#ffffff'
    roundRect(ctx, x, tileY, 460, tileH, 36)
    ctx.fill()
  }

  ctx.fillStyle = BLUE
  ctx.font = '800 28px Arial, sans-serif'
  ctx.fillText('POSITION', 290, tileY + 52)
  ctx.fillText('TOTAL SCORE', 790, tileY + 52)

  const medals: Record<number, [string, string]> = {
    1: ['#ffe08a', '#e0a82e'],
    2: ['#f1f5fb', '#b4c0d2'],
    3: ['#f0b684', '#c0763a'],
  }
  const [medalTop, medalBottom] = medals[r.position] ?? ['#eaf2ff', '#c4d8f5']
  const medal = ctx.createLinearGradient(0, tileY + 70, 0, tileY + 210)
  medal.addColorStop(0, medalTop)
  medal.addColorStop(1, medalBottom)
  ctx.save()
  ctx.shadowColor = 'rgba(11,31,107,0.3)'
  ctx.shadowBlur = 14
  ctx.shadowOffsetY = 8
  ctx.fillStyle = medal
  ctx.beginPath()
  ctx.arc(290, tileY + 140, 76, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.arc(290, tileY + 140, 64, 0, Math.PI * 2)
  ctx.stroke()
  const ord = ordinal(r.position)
  ctx.fillStyle = NAVY
  ctx.font = `900 ${ord.length > 3 ? 40 : 50}px Arial, sans-serif`
  ctx.textBaseline = 'middle'
  ctx.fillText(ord, 290, tileY + 144)

  const pct = Math.max(0, Math.min(1, r.total / 100))
  ctx.lineWidth = 22
  ctx.lineCap = 'round'
  ctx.strokeStyle = '#e3ebfb'
  ctx.beginPath()
  ctx.arc(790, tileY + 140, 66, 0, Math.PI * 2)
  ctx.stroke()
  if (pct > 0) {
    const ring = ctx.createLinearGradient(720, tileY + 70, 860, tileY + 210)
    ring.addColorStop(0, '#2366A8')
    ring.addColorStop(1, '#4fd1c5')
    ctx.strokeStyle = ring
    ctx.beginPath()
    ctx.arc(790, tileY + 140, 66, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct)
    ctx.stroke()
  }
  ctx.fillStyle = NAVY
  ctx.font = '900 40px Arial, sans-serif'
  ctx.fillText(`${r.total}%`, 790, tileY + 144)
  ctx.textBaseline = 'alphabetic'

  ctx.fillStyle = '#64748b'
  ctx.font = '600 26px Arial, sans-serif'
  ctx.fillText(`out of ${r.totalStudents} students`, 290, tileY + 252)
  ctx.fillText('out of 100%', 790, tileY + 252)

  // Breakdown bars
  const rows = [
    { label: 'Attendance', detail: `${r.daysPresent}/${r.weekDays} days`, score: r.attendanceScore, max: r.weights.attendance },
    { label: 'Punctuality', detail: `${r.onTimeDays}/${r.weekDays} on time`, score: r.punctualityScore, max: r.weights.punctuality },
    { label: 'Tasks', detail: `${r.tasksSubmitted}/${r.weekDays} submitted`, score: r.taskScore, max: r.weights.tasks },
  ]
  rows.forEach((row, i) => {
    const y = 1170 + i * 120
    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    roundRect(ctx, 60, y, W - 120, 102, 30)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'
    ctx.lineWidth = 2
    roundRect(ctx, 60, y, W - 120, 102, 30)
    ctx.stroke()

    ctx.textAlign = 'left'
    ctx.fillStyle = '#ffffff'
    ctx.font = '800 34px Arial, sans-serif'
    ctx.fillText(row.label, 94, y + 44)
    ctx.fillStyle = LIGHT
    ctx.font = '600 24px Arial, sans-serif'
    ctx.fillText(row.detail, 94, y + 80)
    ctx.textAlign = 'right'
    ctx.fillStyle = '#ffffff'
    ctx.font = '900 34px Arial, sans-serif'
    ctx.fillText(`${row.score}/${row.max}`, W - 94, y + 44)

    const barX = 440
    const barW = W - 94 - barX - 130
    ctx.fillStyle = 'rgba(4,14,50,0.45)'
    roundRect(ctx, barX, y + 60, barW, 24, 12)
    ctx.fill()
    const share = row.max ? Math.min(1, row.score / row.max) : 0
    if (share > 0) {
      const fillW = Math.max(24, barW * share)
      const fill = ctx.createLinearGradient(barX, 0, barX + barW, 0)
      fill.addColorStop(0, '#38bdf8')
      fill.addColorStop(1, '#a7f3d0')
      ctx.fillStyle = fill
      roundRect(ctx, barX, y + 60, fillW, 24, 12)
      ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.45)'
      roundRect(ctx, barX + 6, y + 63, Math.max(12, fillW - 12), 6, 3)
      ctx.fill()
    }
  })

  ctx.textAlign = 'center'
  ctx.fillStyle = LIGHT
  ctx.font = '600 26px Arial, sans-serif'
  ctx.fillText('Ranked on attendance, punctuality & task submissions', W / 2, 1568)
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
