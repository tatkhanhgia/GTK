import { NextRequest, NextResponse } from 'next/server'
import { unsubscribeNewsletter } from '@/lib/email/newsletter-actions'

/**
 * GET /api/newsletter/unsubscribe?token=<token>&locale=<vi|en>
 * Processes unsubscribe from email link click and redirects to home.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 })
  }

  await unsubscribeNewsletter(token)

  const locale = request.nextUrl.searchParams.get('locale') || 'vi'
  return NextResponse.redirect(new URL(`/${locale}?unsubscribed=1`, request.url))
}
