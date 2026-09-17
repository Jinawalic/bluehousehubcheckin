import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

const roles = ['student', 'mentor']

function unauthorized(error: unknown) {
  return error instanceof Error && error.message === 'UNAUTHORIZED'
}

export async function GET() {
  try {
    await requireAdmin()
    const [participants, attendance, absences, setting] = await Promise.all([
      prisma.participant.findMany({ where: { role: { in: roles } }, orderBy: { createdAt: 'desc' } }),
      prisma.attendance.findMany({ where: { role: { in: roles } }, orderBy: { timestamp: 'desc' }, take: 500 }),
      prisma.absenceRequest.findMany({ where: { role: { in: roles } }, orderBy: { createdAt: 'desc' }, take: 500 }),
      prisma.hubSetting.findUnique({ where: { id: 'default' } }),
    ])
    return NextResponse.json({
      students: participants.map((p) => ({ ...p, registeredAt: p.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) })),
      records: attendance,
      absences,
      setting: setting ?? { geofenceRadius: 100 },
    })
  } catch (error) {
    if (unauthorized(error)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    console.error('Admin dashboard load failed', error)
    return NextResponse.json({ error: 'Unable to load dashboard data.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const identifier = typeof body.identifier === 'string' ? body.identifier.trim().toUpperCase() : ''
    const role = typeof body.role === 'string' ? body.role : ''
    const track = typeof body.track === 'string' && body.track.trim() ? body.track.trim() : 'General'
    if (!name || !identifier || !roles.includes(role)) return NextResponse.json({ error: 'Name, identifier, and role are required.' }, { status: 400 })
    const now = new Date()
    const checkInTime = new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit', hour12: true }).format(now)
    const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos' }).format(now)
    const record = await prisma.attendance.create({ data: { name, identifier, role, track, checkInTime, date, distanceMeters: 0, status: 'excused', notes: 'Admin manual entry override' } })
    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    if (unauthorized(error)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    console.error('Manual attendance failed', error)
    return NextResponse.json({ error: 'Unable to record attendance.' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin()
    const { absenceId, status, geofenceRadius } = await request.json()
    if (typeof absenceId === 'string' && (status === 'approved' || status === 'rejected')) {
      const absence = await prisma.absenceRequest.update({ where: { id: absenceId }, data: { status, reviewedBy: admin.email, reviewedAt: new Date() } })
      return NextResponse.json(absence)
    }
    if (Number.isInteger(geofenceRadius) && geofenceRadius >= 20 && geofenceRadius <= 500) {
      const setting = await prisma.hubSetting.upsert({ where: { id: 'default' }, update: { geofenceRadius }, create: { id: 'default', geofenceRadius } })
      return NextResponse.json(setting)
    }
    return NextResponse.json({ error: 'Invalid update.' }, { status: 400 })
  } catch (error) {
    if (unauthorized(error)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Unable to save changes.' }, { status: 500 })
  }
}
