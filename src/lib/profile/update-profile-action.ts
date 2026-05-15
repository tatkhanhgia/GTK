'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { userProfiles } from '@/db/schema/user-profiles'
import { user } from '@/db/schema/auth'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth/auth-helpers'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'

interface UpdateProfileInput {
  displayName?: string
  bio?: string
  localePreference?: string
}

/**
 * Server action: upsert user profile (display name, bio, locale preference).
 * Requires an active session — throws if unauthenticated.
 *
 * Note: db is cast via `as any` to work around the dual drizzle-orm instance
 * conflict between the project's `drizzle-orm` and `@payloadcms/drizzle`'s
 * bundled copy — a pre-existing issue across the whole codebase.
 */
export async function updateProfile(input: UpdateProfileInput) {
  const session = await getSession()
  if (!session) throw new Error('Not authenticated')

  const payload = await getPayload({ config })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = payload.db.drizzle as any

  const displayName = input.displayName?.trim().slice(0, 80) || null
  const bio = input.bio?.trim().slice(0, 300) || null

  if (displayName) {
    await db
      .update(user)
      .set({ name: displayName, updatedAt: new Date() })
      .where(eq(user.id, session.user.id))
  }

  // Check if profile row already exists for this user
  const existing: Array<typeof userProfiles.$inferSelect> = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, session.user.id))
    .limit(1)

  if (existing.length > 0) {
    await db
      .update(userProfiles)
      .set({
        displayName: displayName ?? existing[0].displayName,
        bio: bio ?? existing[0].bio,
        localePreference: input.localePreference ?? existing[0].localePreference,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, session.user.id))
  } else {
    await db.insert(userProfiles).values({
      id: nanoid(),
      userId: session.user.id,
      displayName,
      bio,
      localePreference: input.localePreference ?? 'vi',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  revalidatePath('/[locale]/profile/settings', 'page')
  return { success: true }
}
