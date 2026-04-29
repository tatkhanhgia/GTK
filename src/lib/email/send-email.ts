import { FROM_EMAIL, getResendClient } from './resend-client'
import type { ReactElement } from 'react'

interface SendEmailOptions {
  to: string | string[]
  subject: string
  react: ReactElement
  from?: string
  replyTo?: string
}

/**
 * Generic email sending wrapper over Resend.
 * Throws on API error so callers can handle or suppress.
 */
export async function sendEmail({ to, subject, react, from = FROM_EMAIL, replyTo }: SendEmailOptions) {
  const resend = getResendClient()
  const result = await resend.emails.send({
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    react,
    ...(replyTo ? { replyTo } : {}),
  })

  if (result.error) {
    throw new Error(`Failed to send email: ${result.error.message}`)
  }

  return result.data
}
