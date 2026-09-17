import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const COOKIE_NAME = 'hub_admin_session'
const SESSION_DAYS = 7

function secret() {
  const value = process.env.AUTH_SECRET
  if (!value) throw new Error('AUTH_SECRET is not configured.')
  return value
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, storedPassword: string) {
  const [salt, storedHash] = storedPassword.split(':')
  if (!salt || !storedHash) return false
  const hash = scryptSync(password, salt, 64)
  const expected = Buffer.from(storedHash, 'hex')
  return expected.length === hash.length && timingSafeEqual(hash, expected)
}

export function createSession(adminId: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DAYS * 24 * 60 * 60
  const payload = `${adminId}.${expiresAt}`
  const signature = createHmac('sha256', secret()).update(payload).digest('hex')
  return `${payload}.${signature}`
}

export function readSession(request: Request) {
  const cookieHeader = request.headers.get('cookie') ?? ''
  const cookie = cookieHeader.split(';').map((item) => item.trim()).find((item) => item.startsWith(`${COOKIE_NAME}=`))
  const token = cookie?.slice(COOKIE_NAME.length + 1)
  if (!token) return null

  const [adminId, expiresAtText, signature] = token.split('.')
  const payload = `${adminId}.${expiresAtText}`
  const expected = createHmac('sha256', secret()).update(payload).digest('hex')
  if (!adminId || !signature || signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null
  if (Number(expiresAtText) < Math.floor(Date.now() / 1000)) return null
  return adminId
}

export function sessionCookie(token: string) {
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SESSION_DAYS * 24 * 60 * 60}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
}

export function getAuthSecretFingerprint() {
  return createHash('sha256').update(secret()).digest('hex').slice(0, 8)
}
