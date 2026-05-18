import type { GlobalConfig } from 'payload'
import { encryptEmailSecret, isEncryptedSecret, maskEmailSecret } from '../lib/email/email-secret-crypto'
import { isPayloadAdminUser } from '../lib/admin/payload-admin-access'

const providerOptions = [
  { label: 'Resend', value: 'resend' },
  { label: 'Zoho ZeptoMail', value: 'zoho' },
  { label: 'Cloudflare Email Service', value: 'cloudflare' },
]

function maskProviderSecrets(doc: Record<string, unknown>) {
  for (const key of ['resendApiKeyEncrypted', 'zohoTokenEncrypted', 'cloudflareApiTokenEncrypted']) {
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
