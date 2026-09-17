import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ROLE_VALUES = ['student', 'mentor', 'corper'] as const

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const identifier = typeof body.identifier === 'string' ? body.identifier.trim().toUpperCase() : ''
    const reason = typeof body.reason === 'string' ? body.reason.trim() : ''
    const role = body.role

    if (!name || !identifier || !reason || !ROLE_VALUES.includes(role)) {
      return NextResponse.json({ error: 'Name, identifier, role, and reason are required.' }, { status: 400 })
    }

    const participant = await prisma.participant.findUnique({ where: { identifier } })
    if (participant && participant.role !== role) {
      return NextResponse.json({ error: 'The identifier does not match the selected role.' }, { status: 400 })
    }

    const submittedAt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Africa/Lagos',
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date())

    const absence = await prisma.absenceRequest.create({
      data: {
        participantId: participant?.id,
        identifier,
        name,
        role,
        reason,
        submittedAt,
      },
    })

    return NextResponse.json({ id: absence.id, status: absence.status }, { status: 201 })
  } catch (error) {
    console.error('Absence submission failed', error)
    return NextResponse.json({ error: 'Unable to submit the absence report right now.' }, { status: 500 })
  }
}
