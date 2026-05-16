import { FROM_EMAIL } from './resend-client'
import type { ReactElement } from 'react'
import { resolveEmailSettings } from './email-settings-service'
import { createEmailProvider } from './email-provider'

interface SendEmailOptions {
  to: string | string[]
  subject: string
  react: ReactElement
  from?: string
  replyTo?: string
}

/**
 * Generic email sending wrapper over the configured provider.
 * Throws on API error so callers can handle or suppress.
 */
export async function sendEmail({ to, subject, react, from = FROM_EMAIL, replyTo }: SendEmailOptions) {
  const settings = await resolveEmailSettings()
  if (!settings.enabled) return null
  const provider = createEmailProvider(settings)
  return provider.send({
    from: from === FROM_EMAIL ? settings.from : from,
    to: Array.isArray(to) ? to : [to],
    subject,
    react,
    ...(replyTo || settings.replyTo ? { replyTo: replyTo || settings.replyTo } : {}),
  })
}
