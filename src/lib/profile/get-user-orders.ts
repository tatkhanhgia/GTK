import { getPayload } from 'payload'
import config from '@payload-config'
import { orders, orderItems } from '@/db/schema/orders'
import { eq, desc } from 'drizzle-orm'

export interface OrderWithItems {
  id: string
  total: number
  currency: string
  paymentMethod: string
  status: string
  createdAt: Date
  items: {
    id: string
    productName: string
    price: number
    currency: string
  }[]
}

/**
 * Fetches all orders for a given user, ordered by most recent first.
 * Each order includes its line items (product snapshot at purchase time).
 *
 * Note: db is cast via `as any` to work around the dual drizzle-orm instance
 * conflict between the project's `drizzle-orm` and `@payloadcms/drizzle`'s
 * bundled copy — a pre-existing issue across the whole codebase.
 */
export async function getUserOrders(userId: string): Promise<OrderWithItems[]> {
  const payload = await getPayload({ config })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = payload.db.drizzle as any

  const userOrders: Array<typeof orders.$inferSelect> = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt))
    .limit(50)

  const result: OrderWithItems[] = []

  for (const order of userOrders) {
    const items: Array<typeof orderItems.$inferSelect> = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id))

    result.push({
      id: order.id,
      total: order.total,
      currency: order.currency,
      paymentMethod: order.paymentMethod,
      status: order.status,
      createdAt: order.createdAt,
      items: items.map((item) => ({
        id: item.id,
        productName: item.productName,
        price: item.price,
        currency: item.currency,
      })),
    })
  }

  return result
}
