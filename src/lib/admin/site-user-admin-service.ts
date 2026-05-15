import { getPayload } from 'payload'
import config from '@payload-config'
import { and, asc, eq, ilike, ne, or } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { session, user, verification } from '@/db/schema/auth'

export type SiteUserStatus = 'active' | 'deactivated'

async function getDb() {
  const payload = await getPayload({ config })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return payload.db.drizzle as any
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export async function listSiteUsers(filters: { query?: string; role?: string; status?: string } = {}) {
  const db = await getDb()
  const clauses = []
  if (filters.query) {
    const q = `%${filters.query.trim()}%`
    clauses.push(or(ilike(user.email, q), ilike(user.name, q)))
  }
  if (filters.role) clauses.push(eq(user.role, filters.role))
  if (filters.status) clauses.push(eq(user.status, filters.status))

  return db
    .select()
    .from(user)
    .where(clauses.length ? and(...clauses) : undefined)
    .orderBy(asc(user.email))
    .limit(100)
}

export async function getSiteUser(id: string) {
  const db = await getDb()
  const rows = await db.select().from(user).where(eq(user.id, id)).limit(1)
  return rows[0] || null
}

export async function updateSiteUser(input: {
  id: string
  name: string
  email: string
  role: string
  status: SiteUserStatus
}) {
  const db = await getDb()
  const email = normalizeEmail(input.email)
  const duplicates = await db.select().from(user).where(and(eq(user.email, email), ne(user.id, input.id))).limit(1)
  if (duplicates.length) throw new Error('Email already exists')

  const banned = input.status === 'deactivated'
  await db
    .update(user)
    .set({
      name: input.name.trim(),
      email,
      role: input.role,
      status: input.status,
      banned,
      banReason: banned ? 'Admin deactivated account' : null,
      banExpires: null,
      updatedAt: new Date(),
    })
    .where(eq(user.id, input.id))

  if (banned) {
    await db.delete(session).where(eq(session.userId, input.id))
  }
}

export async function createPasswordResetToken(userId: string) {
  if (!userId.trim()) throw new Error('User id is required')

  const db = await getDb()
  const rows = await db.select().from(user).where(eq(user.id, userId)).limit(1)
  if (!rows.length) throw new Error('User not found')

  const token = nanoid(32)
  await db.insert(verification).values({
    id: nanoid(),
    identifier: `reset-password:${token}`,
    value: userId,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  return token
}
