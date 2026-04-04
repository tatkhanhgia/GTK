import { getPayload } from 'payload'
import config from '@payload-config'
import { downloadTokens } from '@/db/schema/download-tokens'
import { eq, desc, and } from 'drizzle-orm'

export interface DownloadRecord {
  token: string
  productId: string
  productName?: string
  expiresAt: Date
  revoked: boolean
  createdAt: Date
}

/**
 * Fetches all non-revoked download tokens for a given user.
 * Returns records ordered by most recent first (limit 50).
 *
 * Note: db is cast via `as any` to work around the dual drizzle-orm instance
 * conflict between the project's `drizzle-orm` and `@payloadcms/drizzle`'s
 * bundled copy — a pre-existing issue across the whole codebase.
 */
export async function getUserDownloads(userId: string): Promise<DownloadRecord[]> {
  const payload = await getPayload({ config })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = payload.db.drizzle as any

  const tokens: Array<typeof downloadTokens.$inferSelect> = await db
    .select()
    .from(downloadTokens)
    .where(
      and(
        eq(downloadTokens.userId, userId),
        eq(downloadTokens.revoked, false)
      )
    )
    .orderBy(desc(downloadTokens.createdAt))
    .limit(50)

  return tokens.map((t) => ({
    token: t.token,
    productId: t.productId,
    expiresAt: t.expiresAt,
    revoked: t.revoked,
    createdAt: t.createdAt,
  }))
}
