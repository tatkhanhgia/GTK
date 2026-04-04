import { getPayload } from 'payload'
import config from '@payload-config'
import { sql } from '@payloadcms/db-postgres'
import { generateDownloadToken } from './download-token'

interface OrderRow {
  id: string
  user_id: string
  status: string
}

interface OrderItemRow {
  id: string
  order_id: string
  product_id: string
}

/**
 * Fulfill a paid order: mark as paid, generate download tokens, mark as fulfilled.
 * Idempotent — skips if order is already fulfilled.
 * Uses raw SQL to avoid drizzle-orm dual-version type clash with @payloadcms/drizzle.
 */
export async function fulfillOrder(orderId: string, paymentId: string) {
  const payload = await getPayload({ config })
  const db = payload.db.drizzle

  // Idempotency: fetch current order status
  const orderResult = await db.execute(
    sql`SELECT id, user_id, status FROM orders WHERE id = ${orderId} LIMIT 1`
  )
  const orderRows = (orderResult as { rows: unknown[] }).rows
  if (!orderRows || orderRows.length === 0) return

  const order = orderRows[0] as OrderRow
  if (order.status === 'fulfilled') return

  const now = new Date().toISOString()

  // Mark order as paid
  await db.execute(
    sql`
      UPDATE orders
      SET status = 'paid', payment_id = ${paymentId}, updated_at = ${now}::timestamptz
      WHERE id = ${orderId}
    `
  )

  // Fetch all order items
  const itemsResult = await db.execute(
    sql`SELECT id, order_id, product_id FROM order_items WHERE order_id = ${orderId}`
  )
  const items = (itemsResult as { rows: unknown[] }).rows as OrderItemRow[]

  // Generate download token for each order item
  for (const item of items) {
    await generateDownloadToken(orderId, item.id, item.product_id, order.user_id)
  }

  // Mark as fully fulfilled
  await db.execute(
    sql`
      UPDATE orders
      SET status = 'fulfilled', updated_at = ${now}::timestamptz
      WHERE id = ${orderId}
    `
  )
}
