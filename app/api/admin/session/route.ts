import { NextResponse } from 'next/server'
import { clearSessionCookie, getAdminSession } from '@/lib/admin-auth'

export async function GET() {
  const session = await getAdminSession()
  return session ? NextResponse.json({ user: { name: session.name, email: session.email, role: session.role, avatar: session.avatar } }) : NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(clearSessionCookie)
  return response
}
