import { getPayload } from 'payload'
import config from '@payload-config'
import { sql } from '@payloadcms/db-postgres'
import { nanoid } from 'nanoid'
import { randomBytes } from 'crypto'

interface DownloadTokenRow {
  id: string
  token: string
  order_id: string
  order_item_id: string
  product_id: string
  user_id: string
  expires_at: Date
  revoked: boolean
  download_count: string
  created_at: Date
}

/**
 * Generate a new 48-hour download token stored in DB.
 * Uses opaque random bytes — NOT JWT — so tokens can be revoked server-side.
 * Uses raw SQL to avoid drizzle-orm dual-version type clash with @payloadcms/drizzle.
 */
export async function generateDownloadToken(
  orderId: string,
  orderItemId: string,
  productId: string,
  userId: string
): Promise<string> {
  const payload = await getPayload({ config })
  const db = payload.db.drizzle

  const token = randomBytes(32).toString('hex') // 64-char opaque token
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
  const now = new Date().toISOString()

  await db.execute(
    sql`
      INSERT INTO download_tokens (id, token, order_id, order_item_id, product_id, user_id, expires_at, revoked, download_count, created_at)
      VALUES (
        ${nanoid()},
        ${token},
        ${orderId},
        ${orderItemId},
        ${productId},
        ${userId},
        ${expiresAt}::timestamptz,
        false,
        '0',
        ${now}::timestamptz
      )
    `
  )

  return token
}

/**
 * Validate a download token — returns token record if valid (not expired, not revoked).
 * Returns null if invalid.
 */
export async function validateDownloadToken(token: string): Promise<DownloadTokenRow | null> {
  const payload = await getPayload({ config })
  const db = payload.db.drizzle

  const result = await db.execute(
    sql`
      SELECT id, token, order_id, order_item_id, product_id, user_id, expires_at, revoked, download_count, created_at
      FROM download_tokens
      WHERE token = ${token}
        AND revoked = false
        AND expires_at > NOW()
      LIMIT 1
    `
  )

  // db.execute returns { rows: unknown[] }
  const rows = (result as { rows: unknown[] }).rows
  if (!rows || rows.length === 0) return null

  return rows[0] as DownloadTokenRow
}
