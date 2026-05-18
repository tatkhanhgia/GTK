import type { GlobalConfig } from 'payload'
import { encryptEmailSecret, isEncryptedSecret, maskEmailSecret } from '../lib/email/email-secret-crypto'
import { isPayloadAdminUser } from '../lib/admin/payload-admin-access'

const providerOptions = [
  { label: 'Resend', value: 'resend' },
  { label: 'Zoho ZeptoMail', value: 'zoho' },
  { label: 'SMTP', value: 'smtp' },
  { label: 'Cloudflare Email Service', value: 'cloudflare' },
]

function maskProviderSecrets(doc: Record<string, unknown>) {
  for (const key of ['resendApiKeyEncrypted', 'zohoTokenEncrypted', 'smtpPasswordEncrypted', 'cloudflareApiTokenEncrypted']) {
    if (typeof doc[key] === 'string') {
      doc[key] = maskEmailSecret(doc[key])
    }
  }
}

function preserveOrEncryptEmailSecret(value: unknown, originalDoc?: Record<string, unknown>, key?: string) {
  if (!key) return null

  if (!value || value === maskEmailSecret(String(originalDoc?.[key] ?? ''))) {
    return originalDoc?.[key] ?? null
  }

  const text = String(value)
  return isEncryptedSecret(text) ? text : encryptEmailSecret(text)
}

function requireSecretForProvider(
  value: string | null | undefined,
  siblingData: Record<string, unknown> | undefined,
  provider: string,
  envFallback: string | undefined,
  message: string,
) {
  if (siblingData?.enabled === false || siblingData?.provider !== provider || envFallback) {
    return true
  }
  return value ? true : message
}

export const EmailSettings: GlobalConfig = {
  slug: 'email-settings',
  label: { vi: 'Cai dat email', en: 'Email settings' },
  admin: {
    group: { vi: 'He thong', en: 'System' },
    description: {
      vi: 'Cau hinh dich vu gui email va noi dung welcome email.',
      en: 'Configure email delivery and welcome email copy.',
    },
  },
  access: {
    read: ({ req }) => isPayloadAdminUser(req.user),
    update: ({ req }) => isPayloadAdminUser(req.user),
  },
  hooks: {
    afterRead: [
      ({ doc, context }) => {
        if (!context?.includeEmailSecret) {
          maskProviderSecrets(doc)
        }
        return doc
      },
    ],
  },
  fields: [
    { type: 'checkbox', name: 'enabled', label: { vi: 'Bat gui email', en: 'Enable email sending' }, defaultValue: true },
    { type: 'checkbox', name: 'welcomeEmailEnabled', label: { vi: 'Gui welcome email khi dang ky', en: 'Send welcome email on signup' }, defaultValue: true },
    {
      type: 'select',
      name: 'provider',
      label: { vi: 'Nha cung cap email', en: 'Email provider' },
      defaultValue: 'resend',
      required: true,
      options: providerOptions,
      admin: {
        description: {
          vi: 'Chon provider gui email. Provider duoc cau hinh bang secret trong Payload hoac bien moi truong.',
          en: 'Select the email delivery provider. Providers can use Payload secrets or environment fallback.',
        },
      },
    },
    { type: 'text', name: 'fromName', label: { vi: 'Ten nguoi gui', en: 'From name' }, defaultValue: 'GTKBlog' },
    { type: 'email', name: 'fromEmail', label: { vi: 'Email nguoi gui', en: 'From email' } },
    { type: 'email', name: 'replyTo', label: { vi: 'Reply-to', en: 'Reply-to' } },
    {
      type: 'text',
      name: 'resendApiKeyEncrypted',
      label: { vi: 'Resend API key', en: 'Resend API key' },
      admin: {
        description: {
          vi: 'Dung cho provider Resend. Nhap key moi de thay doi. Key duoc ma hoa truoc khi luu.',
          en: 'Used by the Resend provider. Enter a new key to rotate it. The key is encrypted before save.',
        },
      },
      validate: (value: string | null | undefined, { siblingData }: { siblingData?: Record<string, unknown> }) => {
        const provider = siblingData?.provider || 'resend'
        if (siblingData?.enabled === false || provider !== 'resend' || process.env.RESEND_API_KEY) {
          return true
        }
        return value ? true : 'Resend API key is required when email sending is enabled.'
      },
      hooks: {
        beforeChange: [
          ({ value, originalDoc }) => preserveOrEncryptEmailSecret(
            value,
            originalDoc as Record<string, unknown> | undefined,
            'resendApiKeyEncrypted',
          ),
        ],
      },
    },
    {
      type: 'text',
      name: 'zohoTokenEncrypted',
      label: { vi: 'Zoho ZeptoMail token', en: 'Zoho ZeptoMail token' },
      admin: {
        condition: (_, siblingData) => siblingData.provider === 'zoho',
        description: {
          vi: 'Nhap Send Mail Token cua Zoho ZeptoMail. Token duoc ma hoa truoc khi luu.',
          en: 'Enter the Zoho ZeptoMail Send Mail Token. The token is encrypted before save.',
        },
      },
      validate: (value: string | null | undefined, { siblingData }: { siblingData?: Record<string, unknown> }) => requireSecretForProvider(
        value,
        siblingData,
        'zoho',
        process.env.ZOHO_ZEPTOMAIL_TOKEN,
        'Zoho ZeptoMail token is required when Zoho email provider is enabled.',
      ),
      hooks: {
        beforeChange: [
          ({ value, originalDoc }) => preserveOrEncryptEmailSecret(
            value,
            originalDoc as Record<string, unknown> | undefined,
            'zohoTokenEncrypted',
          ),
        ],
      },
    },
    {
      type: 'text',
      name: 'zohoApiUrl',
      label: { vi: 'Zoho API URL', en: 'Zoho API URL' },
      defaultValue: 'https://api.zeptomail.com/v1.1/email',
      admin: {
        condition: (_, siblingData) => siblingData.provider === 'zoho',
        description: {
          vi: 'Doi URL neu tai khoan ZeptoMail dung data center khac.',
          en: 'Override this URL if your ZeptoMail account uses another data center.',
        },
      },
    },
    {
      type: 'text',
      name: 'smtpHost',
      label: { vi: 'SMTP host', en: 'SMTP host' },
      defaultValue: 'smtppro.zoho.com',
      admin: {
        condition: (_, siblingData) => siblingData.provider === 'smtp',
        description: {
          vi: 'Host SMTP tu nha cung cap email. Zoho thuong dung smtp.zoho.com hoac smtppro.zoho.com.',
          en: 'SMTP host from your email provider. Zoho usually uses smtp.zoho.com or smtppro.zoho.com.',
        },
      },
      validate: (value: string | null | undefined, { siblingData }: { siblingData?: Record<string, unknown> }) => requireSecretForProvider(
        value,
        siblingData,
        'smtp',
        process.env.SMTP_HOST,
        'SMTP host is required when SMTP email provider is enabled.',
      ),
    },
    {
      type: 'number',
      name: 'smtpPort',
      label: { vi: 'SMTP port', en: 'SMTP port' },
      defaultValue: 465,
      admin: {
        condition: (_, siblingData) => siblingData.provider === 'smtp',
        description: {
          vi: 'Dung 465 voi SSL hoac 587 voi TLS/STARTTLS.',
          en: 'Use 465 for SSL or 587 for TLS/STARTTLS.',
        },
      },
    },
    {
      type: 'checkbox',
      name: 'smtpSecure',
      label: { vi: 'SMTP secure SSL', en: 'SMTP secure SSL' },
      defaultValue: true,
      admin: {
        condition: (_, siblingData) => siblingData.provider === 'smtp',
        description: {
          vi: 'Bat cho port 465. Tat cho port 587.',
          en: 'Enable for port 465. Disable for port 587.',
        },
      },
    },
    {
      type: 'text',
      name: 'smtpUser',
      label: { vi: 'SMTP username', en: 'SMTP username' },
      admin: {
        condition: (_, siblingData) => siblingData.provider === 'smtp',
        description: {
          vi: 'Thuong la dia chi email day du, vi du contact@domain.com.',
          en: 'Usually the full mailbox address, for example contact@domain.com.',
        },
      },
      validate: (value: string | null | undefined, { siblingData }: { siblingData?: Record<string, unknown> }) => requireSecretForProvider(
        value,
        siblingData,
        'smtp',
        process.env.SMTP_USER,
        'SMTP username is required when SMTP email provider is enabled.',
      ),
    },
    {
      type: 'text',
      name: 'smtpPasswordEncrypted',
      label: { vi: 'SMTP password', en: 'SMTP password' },
      admin: {
        condition: (_, siblingData) => siblingData.provider === 'smtp',
        description: {
          vi: 'Nhap app password cua mailbox SMTP. Mat khau duoc ma hoa truoc khi luu.',
          en: 'Enter the SMTP mailbox app password. The password is encrypted before save.',
        },
      },
      validate: (value: string | null | undefined, { siblingData }: { siblingData?: Record<string, unknown> }) => requireSecretForProvider(
        value,
        siblingData,
        'smtp',
        process.env.SMTP_PASSWORD,
        'SMTP password is required when SMTP email provider is enabled.',
      ),
      hooks: {
        beforeChange: [
          ({ value, originalDoc }) => preserveOrEncryptEmailSecret(
            value,
            originalDoc as Record<string, unknown> | undefined,
            'smtpPasswordEncrypted',
          ),
        ],
      },
    },
    {
      type: 'text',
      name: 'cloudflareApiTokenEncrypted',
      label: { vi: 'Cloudflare Email API token', en: 'Cloudflare Email API token' },
      admin: {
        condition: (_, siblingData) => siblingData.provider === 'cloudflare',
        description: {
          vi: 'Token Cloudflare Email Service. Token duoc ma hoa truoc khi luu.',
          en: 'Cloudflare Email Service token. The token is encrypted before save.',
        },
      },
      validate: (value: string | null | undefined, { siblingData }: { siblingData?: Record<string, unknown> }) => requireSecretForProvider(
        value,
        siblingData,
        'cloudflare',
        process.env.CLOUDFLARE_EMAIL_API_TOKEN,
        'Cloudflare Email API token is required when Cloudflare email provider is enabled.',
      ),
      hooks: {
        beforeChange: [
          ({ value, originalDoc }) => preserveOrEncryptEmailSecret(
            value,
            originalDoc as Record<string, unknown> | undefined,
            'cloudflareApiTokenEncrypted',
          ),
        ],
      },
    },
    {
      type: 'text',
      name: 'cloudflareAccountId',
      label: { vi: 'Cloudflare account ID', en: 'Cloudflare account ID' },
      admin: {
        condition: (_, siblingData) => siblingData.provider === 'cloudflare',
      },
      validate: (value: string | null | undefined, { siblingData }: { siblingData?: Record<string, unknown> }) => {
        if (siblingData?.enabled === false || siblingData?.provider !== 'cloudflare' || process.env.CLOUDFLARE_ACCOUNT_ID) {
          return true
        }
        return value ? true : 'Cloudflare account ID is required when Cloudflare email provider is enabled.'
      },
    },
    {
      type: 'text',
      name: 'cloudflareApiUrl',
      label: { vi: 'Cloudflare API URL', en: 'Cloudflare API URL' },
      defaultValue: 'https://api.cloudflare.com/client/v4',
      admin: {
        condition: (_, siblingData) => siblingData.provider === 'cloudflare',
      },
    },
    { type: 'text', name: 'welcomeSubjectVi', label: 'Subject VI' },
    { type: 'textarea', name: 'welcomeBodyVi', label: 'Body VI' },
    { type: 'text', name: 'welcomeSubjectEn', label: 'Subject EN' },
    { type: 'textarea', name: 'welcomeBodyEn', label: 'Body EN' },
  ],
}
