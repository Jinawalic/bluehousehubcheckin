import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSession, hashPassword, sessionCookie } from '@/lib/admin-auth'

export async function GET() {
  const count = await prisma.adminUser.count()
  return NextResponse.json({ available: count === 0 })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 })
    }
    if (password.length < 10) {
      return NextResponse.json({ error: 'Use a password with at least 10 characters.' }, { status: 400 })
    }

    const existingAdmin = await prisma.adminUser.findFirst({ select: { id: true } })
    if (existingAdmin) {
      return NextResponse.json({ error: 'Admin registration is already closed.' }, { status: 409 })
    }

    const admin = await prisma.adminUser.create({
      data: { name, email, password: await hashPassword(password) },
    })
    const response = NextResponse.json({
      user: { name: admin.name, email: admin.email, role: admin.role, avatar: admin.avatar },
    }, { status: 201 })
    response.cookies.set(sessionCookie(createSession(admin), true))
    return response
  } catch (error) {
    console.error('Admin registration failed', error)
    return NextResponse.json({ error: 'Unable to create the administrator account.' }, { status: 500 })
  }
}
