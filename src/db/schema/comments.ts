import { pgTable, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const commentStatusEnum = pgEnum('comment_status', [
  'pending',
  'approved',
  'rejected',
  'deleted',
])

export const comments = pgTable('comments', {
  id: text('id').primaryKey().notNull(),
  postId: text('post_id').notNull(), // Payload post document ID
  userId: text('user_id').notNull(), // Better Auth user ID
  content: text('content').notNull(),
  parentId: text('parent_id'), // null = top-level, set = reply
  status: commentStatusEnum('status').notNull().default('approved'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
