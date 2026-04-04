import { pgTable, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'paid',
  'fulfilled',
  'refunded',
  'cancelled',
])

export const paymentMethodEnum = pgEnum('payment_method', ['stripe', 'sepay'])

export const orders = pgTable('orders', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id').notNull(),
  total: integer('total').notNull(), // in smallest currency unit
  currency: text('currency').notNull().default('USD'),
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  paymentId: text('payment_id'), // Stripe charge ID or SePay transaction ID
  status: orderStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const orderItems = pgTable('order_items', {
  id: text('id').primaryKey().notNull(),
  orderId: text('order_id').notNull(),
  productId: text('product_id').notNull(), // Payload product document ID
  productName: text('product_name').notNull(), // snapshot at time of purchase
  price: integer('price').notNull(), // in smallest currency unit
  currency: text('currency').notNull().default('USD'),
  quantity: integer('quantity').notNull().default(1),
})
