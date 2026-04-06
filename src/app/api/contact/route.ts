import { NextRequest, NextResponse } from 'next/server'
import { contactRatelimit } from '@/lib/rate-limit'
import { sendEmail } from '@/lib/email/send-email'
import { ContactNotification } from '@/emails/contact-notification'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  // 1. Rate limit
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await contactRatelimit.limit(`contact:${ip}`)
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  // 2. Parse & validate body
  let body: { name?: string; email?: string; message?: string; locale?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, email, message, locale = 'vi' } = body

  // Type guards — reject non-string values
  if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }
  if (!name || !email || !message) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }
  if (name.length > 100 || email.length > 254 || message.length > 2000) {
    return NextResponse.json({ error: 'Input too long' }, { status: 400 })
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  // 3. Get contactEmail from CMS
  let contactEmail: string | undefined
  try {
    const payload = await getPayload({ config })
    const profile = await payload.findGlobal({ slug: 'author-profile' })
    contactEmail = profile.contactEmail ?? undefined
  } catch {
    // CMS unavailable
  }

  if (!contactEmail) {
    return NextResponse.json({ error: 'Contact not configured' }, { status: 503 })
  }

  // 4. Send email with reply-to set to sender
  const sanitizedName = name.replace(/[\r\n]/g, ' ')
  try {
    await sendEmail({
      to: contactEmail,
      subject: `[GTKBlog] Message from ${sanitizedName}`,
      react: ContactNotification({ senderName: sanitizedName, senderEmail: email, message, locale }),
      replyTo: email,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
