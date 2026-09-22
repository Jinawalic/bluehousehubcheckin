import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

const roles = ['student', 'mentor']

function unauthorized(error: unknown) {
  return error instanceof Error && error.message === 'UNAUTHORIZED'
}

const DEFAULT_HUB_SETTING = {
  id: 'default',
  latitude: 9.88452647721506,
  longitude: 8.876546119960212,
  geofenceRadius: 100,
  openHour: 9,
  closeHour: 18,
  timezone: 'Africa/Lagos',
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
      setting: setting ? {
        id: setting.id,
        latitude: setting.latitude,
        longitude: setting.longitude,
        geofenceRadius: setting.geofenceRadius,
        openHour: setting.openHour,
        closeHour: setting.closeHour,
        timezone: setting.timezone,
      } : DEFAULT_HUB_SETTING,
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
    const status = (body.status === 'late' || body.status === 'excused' || body.status === 'on-time') ? body.status : 'on-time'
    const notes = typeof body.notes === 'string' && body.notes.trim() ? body.notes.trim() : 'Admin manual entry override'

    if (!name || !identifier || !roles.includes(role)) {
      return NextResponse.json({ error: 'Name, identifier, and role are required.' }, { status: 400 })
    }

    // Try to find matching participant to link participantId
    let participantId: string | null = typeof body.participantId === 'string' ? body.participantId : null
    if (!participantId) {
      const matched = await prisma.participant.findFirst({
        where: {
          OR: [
            { identifier },
            { name: { equals: name, mode: 'insensitive' } },
          ],
        },
        select: { id: true },
      })
      if (matched) {
        participantId = matched.id
      }
    }

    const now = new Date()
    const checkInTime = new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit', hour12: true }).format(now)
    const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos' }).format(now)

    const record = await prisma.attendance.create({
      data: {
        participantId,
        name,
        identifier,
        role,
        track,
        checkInTime,
        date,
        distanceMeters: 0,
        status,
        notes,
      },
    })
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
    const body = await request.json()
    const { absenceId, status, geofenceRadius, latitude, longitude, openHour, closeHour, timezone } = body

    if (typeof absenceId === 'string' && (status === 'approved' || status === 'rejected')) {
      const absence = await prisma.absenceRequest.update({ where: { id: absenceId }, data: { status, reviewedBy: admin.email, reviewedAt: new Date() } })
      return NextResponse.json(absence)
    }

    const updateData: Record<string, unknown> = {}
    if (typeof geofenceRadius === 'number' && !isNaN(geofenceRadius) && geofenceRadius >= 10 && geofenceRadius <= 1000) {
      updateData.geofenceRadius = Math.round(geofenceRadius)
    }
    if (typeof latitude === 'number' && !isNaN(latitude) && latitude >= -90 && latitude <= 90) {
      updateData.latitude = latitude
    }
    if (typeof longitude === 'number' && !isNaN(longitude) && longitude >= -180 && longitude <= 180) {
      updateData.longitude = longitude
    }
    if (typeof openHour === 'number' && !isNaN(openHour) && openHour >= 0 && openHour <= 23) {
      updateData.openHour = Math.round(openHour)
    }
    if (typeof closeHour === 'number' && !isNaN(closeHour) && closeHour >= 0 && closeHour <= 23) {
      updateData.closeHour = Math.round(closeHour)
    }
    if (typeof timezone === 'string' && timezone.trim()) {
      updateData.timezone = timezone.trim()
    }

    if (Object.keys(updateData).length > 0) {
      const setting = await prisma.hubSetting.upsert({
        where: { id: 'default' },
        update: updateData,
        create: {
          id: 'default',
          latitude: (updateData.latitude as number) ?? DEFAULT_HUB_SETTING.latitude,
          longitude: (updateData.longitude as number) ?? DEFAULT_HUB_SETTING.longitude,
          geofenceRadius: (updateData.geofenceRadius as number) ?? DEFAULT_HUB_SETTING.geofenceRadius,
          openHour: (updateData.openHour as number) ?? DEFAULT_HUB_SETTING.openHour,
          closeHour: (updateData.closeHour as number) ?? DEFAULT_HUB_SETTING.closeHour,
          timezone: (updateData.timezone as string) ?? DEFAULT_HUB_SETTING.timezone,
        },
      })
      return NextResponse.json(setting)
    }

    return NextResponse.json({ error: 'Invalid update parameters.' }, { status: 400 })
  } catch (error) {
    if (unauthorized(error)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    console.error('Dashboard PATCH failed', error)
    return NextResponse.json({ error: 'Unable to save changes.' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin()
    const id = new URL(request.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Attendance id is required.' }, { status: 400 })
    await prisma.attendance.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (unauthorized(error)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    console.error('Delete attendance failed', error)
    return NextResponse.json({ error: 'Unable to delete attendance record.' }, { status: 500 })
  }
}

