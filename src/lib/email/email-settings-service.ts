import { getPayload } from 'payload'
import config from '@payload-config'
import { decryptEmailSecret } from './email-secret-crypto'

export type EmailLocale = 'vi' | 'en'
export type EmailProviderName = 'resend' | 'zoho' | 'smtp' | 'cloudflare'

export type EmailDeliverySettings =
  | { provider: 'resend'; apiKey: string | null }
  | { provider: 'zoho'; token: string | null; apiUrl: string }
  | { provider: 'smtp'; host: string | null; port: number; secure: boolean; user: string | null; password: string | null }
  | { provider: 'cloudflare'; apiToken: string | null; accountId: string | null; apiUrl: string }

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
  if (value === 'zoho') return 'zoho'
  if (value === 'smtp') return 'smtp'
  if (value === 'cloudflare') return 'cloudflare'
  throw new Error(`Unsupported email provider: ${String(value)}`)
}

const smtpDefaults = {
  host: 'smtppro.zoho.com',
  port: 465,
  secure: true,
}

function toPort(value: unknown, fallback: number) {
  const port = Number(value)
  return Number.isInteger(port) && port > 0 ? port : fallback
}

function toSecure(value: unknown, fallback: boolean) {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  return fallback
}

function resolveWithEnvFallback<T>(docValue: T | undefined, envValue: T | undefined, defaultValue: T) {
  if (envValue !== undefined && (docValue === undefined || docValue === defaultValue)) {
    return envValue
  }

  return docValue ?? envValue ?? defaultValue
}

function resolveDeliverySettings(doc: Record<string, unknown> | null, provider: EmailProviderName): EmailDeliverySettings {
  if (provider === 'resend') {
    const encryptedKey = typeof doc?.resendApiKeyEncrypted === 'string' ? doc.resendApiKeyEncrypted : null
    return {
      provider,
      apiKey: decryptEmailSecret(encryptedKey) || process.env.RESEND_API_KEY || null,
    }
  }

  if (provider === 'zoho') {
    const encryptedToken = typeof doc?.zohoTokenEncrypted === 'string' ? doc.zohoTokenEncrypted : null
    return {
      provider,
      token: decryptEmailSecret(encryptedToken) || process.env.ZOHO_ZEPTOMAIL_TOKEN || null,
      apiUrl: String(doc?.zohoApiUrl || process.env.ZOHO_ZEPTOMAIL_API_URL || 'https://api.zeptomail.com/v1.1/email'),
    }
  }

  if (provider === 'smtp') {
    const encryptedPassword = typeof doc?.smtpPasswordEncrypted === 'string'
      ? doc.smtpPasswordEncrypted
      : null

    return {
      provider,
      host: resolveWithEnvFallback(
        typeof doc?.smtpHost === 'string' && doc.smtpHost ? doc.smtpHost : undefined,
        process.env.SMTP_HOST,
        smtpDefaults.host,
      ),
      port: resolveWithEnvFallback(
        doc?.smtpPort === undefined || doc.smtpPort === null ? undefined : toPort(doc.smtpPort, smtpDefaults.port),
        process.env.SMTP_PORT ? toPort(process.env.SMTP_PORT, smtpDefaults.port) : undefined,
        smtpDefaults.port,
      ),
      secure: resolveWithEnvFallback(
        doc?.smtpSecure === undefined || doc.smtpSecure === null ? undefined : toSecure(doc.smtpSecure, smtpDefaults.secure),
        process.env.SMTP_SECURE === undefined ? undefined : toSecure(process.env.SMTP_SECURE, smtpDefaults.secure),
        smtpDefaults.secure,
      ),
      user: String(doc?.smtpUser || process.env.SMTP_USER || '') || null,
      password: decryptEmailSecret(encryptedPassword) || process.env.SMTP_PASSWORD || null,
    }
  }

  const encryptedToken = typeof doc?.cloudflareApiTokenEncrypted === 'string'
    ? doc.cloudflareApiTokenEncrypted
    : null

  return {
    provider,
    apiToken: decryptEmailSecret(encryptedToken) || process.env.CLOUDFLARE_EMAIL_API_TOKEN || null,
    accountId: String(doc?.cloudflareAccountId || process.env.CLOUDFLARE_ACCOUNT_ID || '') || null,
    apiUrl: String(doc?.cloudflareApiUrl || process.env.CLOUDFLARE_EMAIL_API_URL || 'https://api.cloudflare.com/client/v4'),
  }
}

function buildResolvedEmailSettings(doc: Record<string, unknown> | null, enabled: boolean): ResolvedEmailSettings {
  const provider = resolveProvider(doc?.provider)
  const fromEmail = String(doc?.fromEmail || process.env.RESEND_FROM_EMAIL || 'noreply@gtkblog.com')
  const fromName = String(doc?.fromName || 'GTKBlog')

  return {
    enabled,
    welcomeEmailEnabled: enabled && doc?.welcomeEmailEnabled !== false,
    provider,
    delivery: resolveDeliverySettings(doc, provider),
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
