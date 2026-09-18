import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
    const school = typeof body.school === 'string' ? body.school.trim() : ''
    const track = typeof body.track === 'string' ? body.track.trim() : ''
    const studentType = body.studentType === 'intern' ? 'intern' : 'private'
    const months = Number(body.months)

    if (!name || !email || !phone || !school || !track || !Number.isInteger(months) || months < 1) {
      return NextResponse.json({ error: 'All student registration fields are required.' }, { status: 400 })
    }

    const existingEmail = await prisma.participant.findFirst({ where: { email } })
    if (existingEmail) {
      return NextResponse.json({ error: 'A participant with this email already exists.' }, { status: 409 })
    }
    const existingName = await prisma.participant.findFirst({ where: { name: { equals: name, mode: 'insensitive' }, role: 'student' } })
    if (existingName) {
      return NextResponse.json({ error: 'A student with this name already exists. Use the registered full name to check in.' }, { status: 409 })
    }

    const participant = await prisma.$transaction(async (transaction) => {
      const identifier = name
      return transaction.participant.create({
        data: { name, email, phone, school, track, studentType, months, role: 'student', identifier },
      })
    })

    return NextResponse.json({ id: participant.id, name: participant.name }, { status: 201 })
  } catch (error) {
    console.error('Student registration failed', error)
    return NextResponse.json({ error: 'Unable to register the student right now.' }, { status: 500 })
  }
}
