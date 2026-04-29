import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAuth } from './auth-config'

/**
 * Get current session server-side (App Router Server Components)
 */
export async function getSession() {
  const session = await getAuth().api.getSession({
    headers: await headers(),
  })
  return session
}

/**
 * Require authentication — redirects to login if no session
 */
export async function requireAuth(locale: string = 'vi') {
  const session = await getSession()
  if (!session) {
    redirect(`/${locale}/login`)
  }
  return session
}

/**
 * Require admin role — redirects to home if not admin
 */
export async function requireAdmin(locale: string = 'vi') {
  const session = await requireAuth(locale)
  if (session.user.role !== 'admin') {
    redirect(`/${locale}`)
  }
  return session
}
