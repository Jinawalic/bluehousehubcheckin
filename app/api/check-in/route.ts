import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ROLE_VALUES = ['student', 'mentor'] as const

type Role = (typeof ROLE_VALUES)[number]

function isRole(value: unknown): value is Role {
  return typeof value === 'string' && ROLE_VALUES.includes(value as Role)
}

function lagosDateAndTime() {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Lagos',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(now)
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '0'
  const hour = Number(get('hour'))
  const date = `${get('year')}-${get('month')}-${get('day')}`
  const checkInTime = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Lagos',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(now)
  return { hour, date, checkInTime }
}

function distanceInMeters(latitude: number, longitude: number, targetLatitude: number, targetLongitude: number) {
  const earthRadius = 6371000
  const toRadians = (value: number) => (value * Math.PI) / 180
  const latitudeDelta = toRadians(targetLatitude - latitude)
  const longitudeDelta = toRadians(targetLongitude - longitude)
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(latitude)) * Math.cos(toRadians(targetLatitude)) * Math.sin(longitudeDelta / 2) ** 2
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function GET() {
  try {
    const setting = await prisma.hubSetting.findUnique({ where: { id: 'default' } })
    const { hour, date, checkInTime } = lagosDateAndTime()
    const openHour = setting?.openHour ?? 9
    const closeHour = setting?.closeHour ?? 18
    const isOpen = hour >= openHour && hour < closeHour

    return NextResponse.json({
      openHour,
      closeHour,
      latitude: setting?.latitude ?? 9.88452647721506,
      longitude: setting?.longitude ?? 8.876546119960212,
      geofenceRadius: setting?.geofenceRadius ?? 100,
      timezone: setting?.timezone ?? 'Africa/Lagos',
      currentHour: hour,
      currentDate: date,
      currentTime: checkInTime,
      isOpen,
    })
  } catch (error) {
    console.error('Failed to get check-in info', error)
    return NextResponse.json({ error: 'Unable to get check-in status' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const rawIdentifier = typeof body.identifier === 'string' ? body.identifier.trim() : ''
    const rawName = typeof body.name === 'string' ? body.name.trim() : ''
    const role = body.role
    const latitude = typeof body.latitude === 'number' ? body.latitude : null
    const longitude = typeof body.longitude === 'number' ? body.longitude : null

    if ((!rawIdentifier && !rawName) || !isRole(role)) {
      return NextResponse.json({ error: 'A valid name or identifier and role are required.' }, { status: 400 })
    }

    // Clean whitespace and prepare case-insensitive search term
    const cleanSearchTerm = (rawName || rawIdentifier).replace(/\s+/g, ' ')
    const identifier = rawIdentifier.toUpperCase()

    const [participant, setting] = await Promise.all([
      role === 'student'
        ? prisma.participant.findFirst({
            where: {
              role: 'student',
              OR: [
                { name: { equals: cleanSearchTerm, mode: 'insensitive' } },
                { identifier: { equals: cleanSearchTerm, mode: 'insensitive' } },
              ],
            },
          })
        : prisma.participant.findFirst({
            where: {
              role: 'mentor',
              OR: [
                { identifier: { equals: rawIdentifier, mode: 'insensitive' } },
                { name: { equals: cleanSearchTerm, mode: 'insensitive' } },
              ],
            },
          }),
      prisma.hubSetting.findUnique({ where: { id: 'default' } }),
    ])

    if (!participant || participant.role !== role || participant.status !== 'active') {
      return NextResponse.json({ error: 'No active participant was found for this name or identifier.' }, { status: 404 })
    }

    const { hour, date, checkInTime } = lagosDateAndTime()
    const openHour = setting?.openHour ?? 9
    const closeHour = setting?.closeHour ?? 18
    if (hour < openHour || hour >= closeHour) {
      return NextResponse.json({ error: `Check-in is open from ${openHour}:00 to ${closeHour}:00 Lagos time.` }, { status: 400 })
    }

    const existingAttendance = await prisma.attendance.findFirst({
      where: { participantId: participant.id, date },
      select: { id: true },
    })
    if (existingAttendance) {
      return NextResponse.json({ error: 'This participant has already checked in today.' }, { status: 409 })
    }

    const hubLatitude = setting?.latitude ?? 9.88452647721506
    const hubLongitude = setting?.longitude ?? 8.876546119960212
    const distanceMeters = latitude !== null && longitude !== null
      ? distanceInMeters(latitude, longitude, hubLatitude, hubLongitude)
      : 0
    const geofenceRadius = setting?.geofenceRadius ?? 100

    if (latitude !== null && longitude !== null && distanceMeters > geofenceRadius) {
      return NextResponse.json({ error: `You are ${Math.round(distanceMeters)}m from the hub. Move within ${geofenceRadius}m to check in.` }, { status: 400 })
    }

    const attendance = await prisma.attendance.create({
      data: {
        participantId: participant.id,
        identifier: participant.identifier,
        name: participant.name,
        role: participant.role,
        track: participant.track,
        latitude,
        longitude,
        distanceMeters,
        status: hour < 10 ? 'on-time' : 'late',
        checkInTime,
        date,
      },
    })

    return NextResponse.json({
      id: attendance.id,
      name: participant.name,
      track: participant.track,
      identifier: participant.identifier,
      role: participant.role,
      checkInTime,
    }, { status: 201 })
  } catch (error) {
    console.error('Check-in failed', error)
    return NextResponse.json({ error: 'Unable to process check-in right now.' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { attendanceId, taskLink, taskReason } = body

    if (!attendanceId || typeof attendanceId !== 'string') {
      return NextResponse.json({ error: 'Attendance ID is required.' }, { status: 400 })
    }

    const cleanLink = typeof taskLink === 'string' ? taskLink.trim() : ''
    const cleanReason = typeof taskReason === 'string' ? taskReason.trim() : ''

    const noteParts: string[] = []
    if (cleanLink) noteParts.push(`Task: ${cleanLink}`)
    if (cleanReason) noteParts.push(`Reason: ${cleanReason}`)

    const updated = await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        notes: noteParts.length > 0 ? noteParts.join(' | ') : 'Task acknowledged (no links submitted)',
      },
    })

    return NextResponse.json({ ok: true, attendance: updated })
  } catch (error) {
    console.error('Task submission update failed', error)
    return NextResponse.json({ error: 'Unable to save task details.' }, { status: 500 })
  }
}
