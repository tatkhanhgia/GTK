import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const userProfiles = pgTable('user_profiles', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id').notNull().unique(), // Better Auth user ID
  displayName: text('display_name'),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  localePreference: text('locale_preference').notNull().default('vi'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
