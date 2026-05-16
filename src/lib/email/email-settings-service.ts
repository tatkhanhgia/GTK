import { getPayload } from 'payload'
import config from '@payload-config'
import { decryptEmailSecret } from './email-secret-crypto'

export type EmailLocale = 'vi' | 'en'
export type EmailProviderName = 'resend'

export type EmailDeliverySettings = {
  provider: 'resend'
  apiKey: string | null
}

export interface ResolvedEmailSettings {
  enabled: boolean
  welcomeEmailEnabled: boolean
  provider: EmailProviderName
  delivery: EmailDeliverySettings
  fromEmail: string
  fromName: string
  from: string
  replyTo?: string
  welcome: Record<EmailLocale, { subject: string; body: string }>
}

const defaultWelcome = {
  vi: {
    subject: 'Chao mung den voi GTKBlog',
    body: 'Cam on ban da tao tai khoan tren GTKBlog. Kham pha cac bai viet ve AI va cong nghe!',
  },
  en: {
    subject: 'Welcome to GTKBlog',
    body: 'Thank you for creating an account on GTKBlog. Explore our articles about AI and technology!',
  },
}

function formatFrom(name: string, email: string) {
  return name ? `${name} <${email}>` : email
}

function resolveProvider(value: unknown): EmailProviderName {
  if (!value) return 'resend'
  if (value === 'resend') return 'resend'
  throw new Error(`Unsupported email provider: ${String(value)}`)
}

function buildResolvedEmailSettings(doc: Record<string, unknown> | null, enabled: boolean): ResolvedEmailSettings {
  const provider = resolveProvider(doc?.provider)
  const fromEmail = String(doc?.fromEmail || process.env.RESEND_FROM_EMAIL || 'noreply@gtkblog.com')
  const fromName = String(doc?.fromName || 'GTKBlog')
  const encryptedKey = typeof doc?.resendApiKeyEncrypted === 'string' ? doc.resendApiKeyEncrypted : null
  const resendApiKey = decryptEmailSecret(encryptedKey) || process.env.RESEND_API_KEY || null

  return {
    enabled,
    welcomeEmailEnabled: enabled && doc?.welcomeEmailEnabled !== false,
    provider,
    delivery: { provider: 'resend', apiKey: resendApiKey },
    fromEmail,
    fromName,
    from: formatFrom(fromName, fromEmail),
    replyTo: typeof doc?.replyTo === 'string' && doc.replyTo ? doc.replyTo : undefined,
    welcome: {
      vi: {
        subject: String(doc?.welcomeSubjectVi || defaultWelcome.vi.subject),
        body: String(doc?.welcomeBodyVi || defaultWelcome.vi.body),
      },
      en: {
        subject: String(doc?.welcomeSubjectEn || defaultWelcome.en.subject),
        body: String(doc?.welcomeBodyEn || defaultWelcome.en.body),
      },
    },
  }
}

export async function resolveEmailSettings(): Promise<ResolvedEmailSettings> {
  let doc: Record<string, unknown> | null = null

  try {
    const payload = await getPayload({ config })
    doc = await payload.findGlobal({
      slug: 'email-settings',
      overrideAccess: true,
      context: { includeEmailSecret: true },
    }) as Record<string, unknown>
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    throw new Error(`Failed to resolve email settings: ${message}`)
  }

  return buildResolvedEmailSettings(doc, doc?.enabled !== false)
}
