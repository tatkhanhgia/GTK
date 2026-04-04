import { resend, FROM_EMAIL } from './resend-client'
import type { ReactElement } from 'react'

interface SendEmailOptions {
  to: string | string[]
  subject: string
  react: ReactElement
  from?: string
}

/**
 * Generic email sending wrapper over Resend.
 * Throws on API error so callers can handle or suppress.
 */
export async function sendEmail({ to, subject, react, from = FROM_EMAIL }: SendEmailOptions) {
  const result = await resend.emails.send({
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    react,
  })

  if (result.error) {
    throw new Error(`Failed to send email: ${result.error.message}`)
  }

  return result.data
}
