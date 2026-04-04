import { NextRequest, NextResponse } from 'next/server'
import { confirmNewsletterSubscription } from '@/lib/email/newsletter-actions'

/**
 * GET /api/newsletter/confirm?token=<token>
 * Double opt-in confirmation — activates pending subscription and redirects.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 })
  }

  const result = await confirmNewsletterSubscription(token)

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  // Redirect to Vietnamese home by default — locale not known at confirm time
  return NextResponse.redirect(new URL('/vi?confirmed=1', request.url))
}
