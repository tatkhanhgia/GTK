import type { Config } from 'drizzle-kit'

// NOTE: Drizzle migrations are run via Payload (`npx payload migrate`).
// This config is for reference/custom schema inspection only.
// Do NOT create a separate Drizzle connection — reuse payload.db.drizzle at runtime.
export default {
  schema: './src/db/schema',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },
} satisfies Config
