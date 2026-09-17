import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto'
import { promisify } from 'util'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

const scrypt = promisify(scryptCallback)
const COOKIE_NAME = 'bhh_admin_session'
const SESSION_SECONDS = 60 * 60 * 12

type Session = { id: string; email: string; name: string; role: string; avatar?: string | null; exp: number }

function secret() {
  const value = process.env.AUTH_SECRET
  if (!value) throw new Error('AUTH_SECRET is not configured.')
  return value
}

function sign(value: string) {
  return createHmac('sha256', secret()).update(value).digest('base64url')
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('base64url')
  const derived = (await scrypt(password, salt, 64)) as Buffer
  return `scrypt$${salt}$${derived.toString('base64url')}`
}

async function passwordMatches(password: string, stored: string) {
  const [algorithm, salt, encodedHash] = stored.split('$')
  if (algorithm !== 'scrypt' || !salt || !encodedHash) return false
  const expected = Buffer.from(encodedHash, 'base64url')
  const derived = (await scrypt(password, salt, expected.length)) as Buffer
  return derived.length === expected.length && timingSafeEqual(derived, expected)
}

async function ensureConfiguredAdmin(email: string) {
  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const configuredPassword = process.env.ADMIN_PASSWORD
  if (!configuredEmail || !configuredPassword || configuredEmail !== email) return

  const existing = await prisma.adminUser.findUnique({ where: { email } })
  if (!existing) {
    await prisma.adminUser.create({
      data: { email, password: await hashPassword(configuredPassword), name: process.env.ADMIN_NAME || 'Hub Administrator' },
    })
  } else if (!existing.password) {
    await prisma.adminUser.update({ where: { email }, data: { password: await hashPassword(configuredPassword) } })
  }
}

export async function authenticateAdmin(email: string, password: string) {
  await ensureConfiguredAdmin(email)
  const admin = await prisma.adminUser.findUnique({ where: { email } })
  if (!admin?.password || !(await passwordMatches(password, admin.password))) return null
  return admin
}

export function createSession(admin: { id: string; email: string; name: string; role: string; avatar?: string | null }) {
  const payload: Session = { ...admin, exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS }
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${encoded}.${sign(encoded)}`
}

export async function getAdminSession(): Promise<Session | null> {
  try {
    const token = (await cookies()).get(COOKIE_NAME)?.value
    if (!token) return null
    const [encoded, signature] = token.split('.')
    if (!encoded || !signature || !timingSafeEqual(Buffer.from(signature), Buffer.from(sign(encoded)))) return null
    const session = JSON.parse(Buffer.from(encoded, 'base64url').toString()) as Session
    return session.exp > Math.floor(Date.now() / 1000) ? session : null
  } catch { return null }
}

export async function requireAdmin() {
  const session = await getAdminSession()
  if (!session) throw new Error('UNAUTHORIZED')
  return session
}

export const sessionCookie = (value: string, remember = false) => ({
  name: COOKIE_NAME, value, httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/',
  maxAge: remember ? 60 * 60 * 24 * 30 : SESSION_SECONDS,
})
export const clearSessionCookie = { name: COOKIE_NAME, value: '', httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 0 }
