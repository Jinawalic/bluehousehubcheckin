import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

const roles = ['student', 'mentor']

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const body = await request.json()
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
