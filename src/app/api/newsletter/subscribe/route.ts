import { NextRequest, NextResponse } from 'next/server'
import { subscribeNewsletter } from '@/lib/email/newsletter-actions'
import { ratelimit } from '@/lib/rate-limit'

/**
 * POST /api/newsletter/subscribe
 * Body: { email: string, locale?: 'vi' | 'en' }
 * Rate-limited to 10 req/10s per IP.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await ratelimit.limit(`newsletter:${ip}`)
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  let body: { email?: string; locale?: string }
  try {
    body = (await request.json()) as { email?: string; locale?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email, locale = 'vi' } = body

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  const normalizedLocale = locale === 'en' ? 'en' : locale === 'vi' ? 'vi' : null
  if (!normalizedLocale) {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 400 })
  }

  const result = await subscribeNewsletter(email.trim().toLowerCase(), normalizedLocale)

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
