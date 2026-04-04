import { getPayload } from 'payload'
import config from '@payload-config'
import { sql } from '@payloadcms/db-postgres'
import { nanoid } from 'nanoid'

interface CreateOrderInput {
  userId: string
  productId: string
  productName: string
  price: number      // smallest unit (cents USD or VND)
  currency: 'USD' | 'VND'
  paymentMethod: 'stripe' | 'sepay'
}

/**
 * Creates a pending order + order item in the database.
 * Uses raw SQL via Payload's bundled drizzle `sql` tag to avoid the
 * drizzle-orm dual-version type clash with @payloadcms/drizzle.
 * Returns the new order ID.
 */
export async function createOrder(input: CreateOrderInput): Promise<string> {
  const payload = await getPayload({ config })
  const db = payload.db.drizzle

  const orderId = nanoid()
  const itemId = nanoid()
  const now = new Date().toISOString()

  await db.execute(
    sql`
      INSERT INTO orders (id, user_id, total, currency, payment_method, payment_id, status, created_at, updated_at)
      VALUES (
        ${orderId},
        ${input.userId},
        ${input.price},
        ${input.currency},
        ${input.paymentMethod},
        NULL,
        'pending',
        ${now}::timestamptz,
        ${now}::timestamptz
      )
    `
  )

  await db.execute(
    sql`
      INSERT INTO order_items (id, order_id, product_id, product_name, price, currency, quantity)
      VALUES (
        ${itemId},
        ${orderId},
        ${input.productId},
        ${input.productName},
        ${input.price},
        ${input.currency},
        1
      )
    `
  )

  return orderId
}
