import { NextResponse } from 'next/server'
import { authenticateAdmin, createSession, sessionCookie } from '@/lib/admin-auth'

export async function POST(request: Request) {
  try {
    const { email: rawEmail, password, remember } = await request.json()
    const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : ''
    if (!email || typeof password !== 'string') return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    const admin = await authenticateAdmin(email, password)
    if (!admin) return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    const response = NextResponse.json({ user: { name: admin.name, email: admin.email, role: admin.role, avatar: admin.avatar } })
    response.cookies.set(sessionCookie(createSession(admin), Boolean(remember)))
    return response
  } catch (error) {
    console.error('Admin login failed', error)
    return NextResponse.json({ error: 'Authentication is unavailable. Check server configuration.' }, { status: 500 })
  }
}
