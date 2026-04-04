'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { nanoid } from 'nanoid'
import { sql } from '@payloadcms/db-postgres'
import { sendEmail } from './send-email'
import * as React from 'react'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/**
 * Subscribe an email to the newsletter with double opt-in.
 * Uses raw SQL via Payload's bundled drizzle sql tag to avoid the
 * drizzle-orm dual-version type clash with @payloadcms/drizzle.
 */
export async function subscribeNewsletter(email: string, locale: string = 'vi') {
  // Validate email format at system boundary
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: locale === 'vi' ? 'Email không hợp lệ' : 'Invalid email' }
  }

  const payload = await getPayload({ config })
  const db = payload.db.drizzle

  // Check existing subscriber status
  const existing = await db.execute(
    sql`SELECT id, status FROM newsletter_subscribers WHERE email = ${email} LIMIT 1`
  )

  const row = existing.rows[0] as { id: string; status: string } | undefined

  if (row?.status === 'active') {
    return { error: locale === 'vi' ? 'Email đã được đăng ký' : 'Email already subscribed' }
  }

  const confirmToken = nanoid(32)
  const now = new Date().toISOString()

  if (row) {
    // Re-subscribe: reset to pending with new token
    await db.execute(
      sql`
        UPDATE newsletter_subscribers
        SET status = 'pending',
            confirm_token = ${confirmToken},
            locale = ${locale},
            unsubscribed_at = NULL,
            created_at = ${now}::timestamptz
        WHERE email = ${email}
      `
    )
  } else {
    await db.execute(
      sql`
        INSERT INTO newsletter_subscribers (id, email, locale, status, confirm_token, created_at)
        VALUES (
          ${nanoid()},
          ${email},
          ${locale},
          'pending',
          ${confirmToken},
          ${now}::timestamptz
        )
      `
    )
  }

  // Send confirmation email — don't fail the subscription if sending fails
  try {
    const { WelcomeEmail } = await import('@/emails/welcome-email')
    await sendEmail({
      to: email,
      subject:
        locale === 'vi'
          ? 'Xác nhận đăng ký nhận bản tin GTKBlog'
          : 'Confirm your GTKBlog newsletter subscription',
      react: React.createElement(WelcomeEmail, {
        name: email.split('@')[0],
        locale,
      }),
    })
  } catch {
    // Silent: subscription recorded; user can request resend if email fails
  }

  return { success: true }
}

/**
 * Unsubscribe by token (from email link click).
 * Sets status to 'unsubscribed' and records timestamp.
 */
export async function unsubscribeNewsletter(token: string) {
  if (!token || token.length < 8) return { error: 'Invalid token' }

  const payload = await getPayload({ config })
  const db = payload.db.drizzle
  const now = new Date().toISOString()

  await db.execute(
    sql`
      UPDATE newsletter_subscribers
      SET status = 'unsubscribed', unsubscribed_at = ${now}::timestamptz
      WHERE confirm_token = ${token}
    `
  )

  return { success: true }
}

/**
 * Confirm subscription by token (double opt-in link).
 * Sets status to 'active' and records subscribedAt timestamp.
 */
export async function confirmNewsletterSubscription(token: string) {
  if (!token || token.length < 8) return { error: 'Invalid token' }

  const payload = await getPayload({ config })
  const db = payload.db.drizzle
  const now = new Date().toISOString()

  await db.execute(
    sql`
      UPDATE newsletter_subscribers
      SET status = 'active',
          subscribed_at = ${now}::timestamptz,
          confirm_token = NULL
      WHERE confirm_token = ${token}
        AND status = 'pending'
    `
  )

  return { success: true }
}

/**
 * Send a new-post newsletter notification to all active subscribers.
 * Filters by subscriber locale to send localised content.
 */
export async function sendNewsletterForPost({
  postTitle,
  postExcerpt,
  postSlug,
  locale,
}: {
  postTitle: string
  postExcerpt: string
  postSlug: string
  locale: string
}) {
  const payload = await getPayload({ config })
  const db = payload.db.drizzle

  const result = await db.execute(
    sql`
      SELECT id, email, confirm_token
      FROM newsletter_subscribers
      WHERE status = 'active' AND locale = ${locale}
    `
  )

  const subscribers = result.rows as { id: string; email: string; confirm_token: string | null }[]

  if (subscribers.length === 0) return { sent: 0 }

  const postUrl = `${APP_URL}/${locale}/blog/${postSlug}`
  const { NewsletterPost } = await import('@/emails/newsletter-post')

  let sent = 0
  for (const sub of subscribers) {
    try {
      const unsubscribeUrl = `${APP_URL}/api/newsletter/unsubscribe?token=${sub.confirm_token ?? sub.id}&locale=${locale}`
      await sendEmail({
        to: sub.email,
        subject: locale === 'vi' ? `Bài mới: ${postTitle}` : `New post: ${postTitle}`,
        react: React.createElement(NewsletterPost, {
          postTitle,
          postExcerpt,
          postUrl,
          unsubscribeUrl,
          locale,
        }),
      })
      sent++
    } catch {
      // Continue sending to remaining subscribers on individual failure
    }
  }

  return { sent }
}
