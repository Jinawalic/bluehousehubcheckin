import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isScheduledDay, scheduleLabel, trackGroup } from '@/lib/track-schedule'

const ATTENDANCE_WEIGHT = 40
const PUNCTUALITY_WEIGHT = 30
const TASK_WEIGHT = 30
const WEEK_DAYS = 3

function weekDates(monday: string) {
  const base = new Date(`${monday}T00:00:00Z`).getTime()
  return Array.from({ length: 5 }, (_, i) => new Date(base + i * 86400000).toISOString().slice(0, 10))
}

function lagosToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos' }).format(new Date())
}

function weekRange(today: string) {
  const base = new Date(`${today}T00:00:00Z`)
  const dow = base.getUTCDay()
  const sinceMonday = dow === 0 ? 6 : dow - 1
  const monday = new Date(base.getTime() - sinceMonday * 86400000)
  const friday = new Date(monday.getTime() + 4 * 86400000)
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  return { start: iso(monday), end: iso(friday) }
}

function minutesOfDay(time: string) {
  const match = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(time)
  if (!match) return 24 * 60
  let h = Number(match[1]) % 12
  if (match[3].toUpperCase() === 'PM') h += 12
  return h * 60 + Number(match[2])
}

export async function GET(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get('participantId')
    if (!id) return NextResponse.json({ error: 'participantId is required.' }, { status: 400 })

    const { start, end } = weekRange(lagosToday())
    const [students, records] = await Promise.all([
      prisma.participant.findMany({ where: { role: 'student', status: 'active' }, select: { id: true, name: true, track: true } }),
      prisma.attendance.findMany({
        where: { role: 'student', date: { gte: start, lte: end } },
        select: { participantId: true, date: true, status: true, checkInTime: true, notes: true },
      }),
    ])

    const stats = new Map<string, { days: Set<string>; onTime: Set<string>; tasks: Set<string>; minutes: number }>()
    for (const r of records) {
      if (!r.participantId) continue
      const s = stats.get(r.participantId) ?? { days: new Set<string>(), onTime: new Set<string>(), tasks: new Set<string>(), minutes: 0 }
      s.days.add(r.date)
      if (r.status === 'on-time' || r.status === 'excused') s.onTime.add(r.date)
      if (r.notes && /Task:\s*\S+/i.test(r.notes)) s.tasks.add(r.date)
      s.minutes += minutesOfDay(r.checkInTime)
      stats.set(r.participantId, s)
    }

    const scored = students.map((st) => {
      const s = stats.get(st.id)
      const group = trackGroup(st.track)
      const expectedDates = new Set(group ? weekDates(start).filter((d) => isScheduledDay(group, d)) : [])
      const countScheduled = (set?: Set<string>) => (set ? [...set].filter((d) => !group || expectedDates.has(d)).length : 0)
      const days = countScheduled(s?.days)
      const onTime = countScheduled(s?.onTime)
      const tasks = countScheduled(s?.tasks)
      const attendanceScore = (Math.min(days, WEEK_DAYS) / WEEK_DAYS) * ATTENDANCE_WEIGHT
      const punctualityScore = (Math.min(onTime, WEEK_DAYS) / WEEK_DAYS) * PUNCTUALITY_WEIGHT
      const taskScore = (Math.min(tasks, WEEK_DAYS) / WEEK_DAYS) * TASK_WEIGHT
      const avgMinutes = days > 0 ? (s?.minutes ?? 0) / (s?.days.size || 1) : 24 * 60
      return { ...st, group, days, onTime, tasks, attendanceScore, punctualityScore, taskScore, total: attendanceScore + punctualityScore + taskScore, avgMinutes }
    })

    // Strict ordering so no two students share a position: score, earlier average arrival, name
    scored.sort((a, b) => b.total - a.total || a.avgMinutes - b.avgMinutes || a.name.localeCompare(b.name))
    const index = scored.findIndex((s) => s.id === id)
    if (index === -1) return NextResponse.json({ error: 'Student not found.' }, { status: 404 })
    const me = scored[index]

    return NextResponse.json({
      name: me.name,
      track: me.track,
      weekStart: start,
      weekEnd: end,
      position: index + 1,
      totalStudents: scored.length,
      daysPresent: me.days,
      onTimeDays: me.onTime,
      tasksSubmitted: me.tasks,
      weekDays: WEEK_DAYS,
      schedule: me.group ? scheduleLabel(me.group, true) : '',
      attendanceScore: Math.round(me.attendanceScore),
      punctualityScore: Math.round(me.punctualityScore),
      taskScore: Math.round(me.taskScore),
      total: Math.round(me.total),
      weights: { attendance: ATTENDANCE_WEIGHT, punctuality: PUNCTUALITY_WEIGHT, tasks: TASK_WEIGHT },
    })
  } catch (error) {
    console.error('Weekly report failed', error)
    return NextResponse.json({ error: 'Unable to build weekly report.' }, { status: 500 })
  }
}
