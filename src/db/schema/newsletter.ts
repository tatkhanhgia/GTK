import { pgTable, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const subscriberStatusEnum = pgEnum('subscriber_status', [
  'pending',
  'active',
  'unsubscribed',
])

export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: text('id').primaryKey().notNull(),
  email: text('email').notNull().unique(),
  locale: text('locale').notNull().default('vi'),
  status: subscriberStatusEnum('status').notNull().default('pending'),
  confirmToken: text('confirm_token'),
  subscribedAt: timestamp('subscribed_at'),
  unsubscribedAt: timestamp('unsubscribed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
