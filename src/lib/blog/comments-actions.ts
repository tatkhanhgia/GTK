'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { getSession } from '@/lib/auth/auth-helpers'
import { nanoid } from 'nanoid'
import { sql } from '@payloadcms/db-postgres'

/**
 * Create a new comment or reply for a post.
 * Requires authentication. Content is trimmed and capped at 2000 chars.
 *
 * NOTE: We use raw SQL via Payload's bundled drizzle `sql` tag to avoid the
 * drizzle-orm dual-version type clash between the top-level drizzle-orm package
 * and the one bundled inside @payloadcms/drizzle.
 */
export async function createComment(
  postId: string,
  content: string,
  parentId?: string
) {
  const session = await getSession()
  if (!session) throw new Error('Not authenticated')

  const trimmed = content.trim().slice(0, 2000)
  if (!trimmed) throw new Error('Comment content cannot be empty')

  const payload = await getPayload({ config })
  const db = payload.db.drizzle

  const id = nanoid()
  const now = new Date().toISOString()

  await db.execute(
    sql`
      INSERT INTO comments (id, post_id, user_id, content, parent_id, status, created_at, updated_at)
      VALUES (
        ${id},
        ${postId},
        ${session.user.id},
        ${trimmed},
        ${parentId ?? null},
        'approved',
        ${now}::timestamptz,
        ${now}::timestamptz
      )
    `
  )

  return { id }
}

/**
 * Soft-delete a comment by setting status to 'deleted'.
 * Only the comment owner or an admin may delete.
 */
export async function deleteComment(commentId: string) {
  const session = await getSession()
  if (!session) throw new Error('Not authenticated')

  const payload = await getPayload({ config })
  const db = payload.db.drizzle

  const now = new Date().toISOString()
  const isAdmin = session.user.role === 'admin'

  if (isAdmin) {
    await db.execute(
      sql`
        UPDATE comments
        SET status = 'deleted', updated_at = ${now}::timestamptz
        WHERE id = ${commentId}
      `
    )
  } else {
    // Users can only delete their own comments
    await db.execute(
      sql`
        UPDATE comments
        SET status = 'deleted', updated_at = ${now}::timestamptz
        WHERE id = ${commentId}
          AND user_id = ${session.user.id}
      `
    )
  }
}
