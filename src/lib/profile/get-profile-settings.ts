import { getPayload } from 'payload'
import config from '@payload-config'
import { eq } from 'drizzle-orm'
import { user } from '@/db/schema/auth'
import { userProfiles } from '@/db/schema/user-profiles'
import { getSession } from '@/lib/auth/auth-helpers'

export async function getProfileSettings() {
  const session = await getSession()
  if (!session) return null

  const payload = await getPayload({ config })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = payload.db.drizzle as any
  const profiles = await db.select().from(userProfiles).where(eq(userProfiles.userId, session.user.id)).limit(1)
  const users = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1)
  const profile = profiles[0]
  const authUser = users[0] || session.user

  return {
    email: authUser.email,
    name: authUser.name,
    displayName: profile?.displayName || authUser.name || '',
    bio: profile?.bio || '',
    localePreference: profile?.localePreference || 'vi',
  }
}
