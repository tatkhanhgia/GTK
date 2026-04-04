import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core'

export const downloadTokens = pgTable('download_tokens', {
  id: text('id').primaryKey().notNull(),
  token: text('token').notNull().unique(), // opaque random token (64-char hex)
  orderId: text('order_id').notNull(),
  orderItemId: text('order_item_id').notNull(),
  productId: text('product_id').notNull(),
  userId: text('user_id').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  revoked: boolean('revoked').notNull().default(false),
  downloadCount: text('download_count').notNull().default('0'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
