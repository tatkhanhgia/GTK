import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { admin } from 'better-auth/plugins/admin'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as authSchema from '@/db/schema/auth'
import { sendWelcomeEmailForUser } from '@/lib/email/send-welcome-email'

function buildAuth() {
  const sql = postgres(process.env.DATABASE_URL || '')
  const db = drizzle(sql, { schema: authSchema })

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: authSchema,
    }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Simplified for launch
    minPasswordLength: 8,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    },
  },
  plugins: [
    nextCookies(),
    admin(),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user, context) => {
          try {
            const cookie = context?.headers?.get('cookie') || ''
            const locale = cookie.match(/NEXT_LOCALE=(en|vi)/)?.[1] || context?.headers?.get('x-locale')
            await sendWelcomeEmailForUser({ email: user.email, name: user.name }, locale)
          } catch (error) {
            console.error('Failed to send welcome email', error)
          }
        },
      },
    },
  },
  user: {
    modelName: 'user',
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'user',
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    modelName: 'session',
  },
  account: {
    modelName: 'account',
  },
  verification: {
    modelName: 'verification',
  },
  advanced: {
    cookiePrefix: 'gtkblog',
  },
})
}

type AuthInstance = ReturnType<typeof buildAuth>

let authSingleton: AuthInstance | undefined

export function getAuth(): AuthInstance {
  if (!authSingleton) {
    authSingleton = buildAuth()
  }

  return authSingleton
}

export type Session = ReturnType<typeof getAuth>['$Infer']['Session']
export type User = ReturnType<typeof getAuth>['$Infer']['Session']['user']
