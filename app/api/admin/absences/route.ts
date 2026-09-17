import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { readSession } from '@/lib/admin-auth'

export async function PATCH(request: Request) {
  const adminId = readSession(request)
  if (!adminId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  const body = await request.json()
  const id = typeof body.id === 'string' ? body.id : ''
  const status = body.status === 'approved' || body.status === 'rejected' ? body.status : null
  if (!id || !status) return NextResponse.json({ error: 'Invalid absence update.' }, { status: 400 })

  const absence = await prisma.absenceRequest.update({
    where: { id },
    data: { status, reviewedBy: adminId, reviewedAt: new Date() },
  })
  return NextResponse.json({ id: absence.id, status: absence.status })
}
