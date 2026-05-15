import WelcomeEmail from '@/emails/welcome-email'
import { sendEmail } from './send-email'
import { resolveEmailSettings, type EmailLocale } from './email-settings-service'

interface WelcomeUser {
  email: string
  name?: string | null
}

function normalizeLocale(locale?: string | null): EmailLocale {
  return locale === 'en' ? 'en' : 'vi'
}

export async function sendWelcomeEmailForUser(user: WelcomeUser, locale?: string | null) {
  const settings = await resolveEmailSettings()
  if (!settings.enabled || !settings.welcomeEmailEnabled) return null

  const resolvedLocale = normalizeLocale(locale)
  const copy = settings.welcome[resolvedLocale]

  return sendEmail({
    to: user.email,
    subject: copy.subject,
    react: WelcomeEmail({ name: user.name || user.email, locale: resolvedLocale, body: copy.body }),
    from: settings.from,
    replyTo: settings.replyTo,
  })
}
