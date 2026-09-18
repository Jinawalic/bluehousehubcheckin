import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

const roles = ['student', 'mentor']

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const body = await request.json()

    // Support Bulk Import
    if (Array.isArray(body.bulk)) {
      const toCreate = body.bulk
        .filter((b: any) => b && typeof b.name === 'string' && b.name.trim() && typeof b.identifier === 'string' && b.identifier.trim() && roles.includes(b.role))
        .map((b: any) => ({
          name: b.name.trim(),
          identifier: b.identifier.trim().toUpperCase(),
          role: b.role,
          track: typeof b.track === 'string' && b.track.trim() ? b.track.trim() : 'General',
          email: typeof b.email === 'string' && b.email.trim() ? b.email.trim().toLowerCase() : null,
          phone: typeof b.phone === 'string' && b.phone.trim() ? b.phone.trim() : null,
        }))

      if (toCreate.length === 0) {
        return NextResponse.json({ error: 'No valid participants to import.' }, { status: 400 })
      }

      const result = await prisma.participant.createMany({
        data: toCreate,
        skipDuplicates: true,
      })
      return NextResponse.json({ count: result.count }, { status: 201 })
    }

    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const identifier = typeof body.identifier === 'string' ? body.identifier.trim().toUpperCase() : ''
    const role = typeof body.role === 'string' ? body.role : ''
    const track = typeof body.track === 'string' && body.track.trim() ? body.track.trim() : 'General'
    if (!name || !identifier || !roles.includes(role)) return NextResponse.json({ error: 'Name, identifier, and role are required.' }, { status: 400 })
    const participant = await prisma.participant.create({ data: { name, identifier, role, track, email: typeof body.email === 'string' ? body.email.trim().toLowerCase() || null : null, phone: typeof body.phone === 'string' ? body.phone.trim() || null : null } })
    return NextResponse.json(participant, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Unable to register participant. The identifier or email may already exist.' }, { status: 400 })
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin()
    const { id, name, track, email, phone, status } = await request.json()
    if (!id) return NextResponse.json({ error: 'Participant id is required.' }, { status: 400 })
    const updateData: Record<string, unknown> = {}
    if (typeof name === 'string' && name.trim()) updateData.name = name.trim()
    if (typeof track === 'string' && track.trim()) updateData.track = track.trim()
    if (typeof email === 'string') updateData.email = email.trim().toLowerCase() || null
    if (typeof phone === 'string') updateData.phone = phone.trim() || null
    if (status === 'active' || status === 'inactive') updateData.status = status
    const updated = await prisma.participant.update({ where: { id }, data: updateData })
    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Unable to update participant.' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin()
    const id = new URL(request.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Participant id is required.' }, { status: 400 })
    await prisma.participant.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Unable to remove participant.' }, { status: 400 })
  }
}
