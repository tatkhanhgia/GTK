import type { GlobalConfig } from 'payload'
import { encryptEmailSecret, isEncryptedSecret, maskEmailSecret } from '../lib/email/email-secret-crypto'
import { isPayloadAdminUser } from '../lib/admin/payload-admin-access'

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
        if (!context?.includeEmailSecret && typeof doc.resendApiKeyEncrypted === 'string') {
          doc.resendApiKeyEncrypted = maskEmailSecret(doc.resendApiKeyEncrypted)
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
      options: [{ label: 'Resend', value: 'resend' }],
      admin: {
        description: {
          vi: 'Hien tai chi Resend duoc ho tro. Zoho va Cloudflare se chi bat khi hoan tat adapter, schema, validation va docs.',
          en: 'Only Resend is currently supported. Zoho and Cloudflare will be enabled after adapters, schema, validation, and docs are complete.',
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
          ({ value, originalDoc }) => {
            if (!value || value === maskEmailSecret(String(originalDoc?.resendApiKeyEncrypted ?? ''))) {
              return originalDoc?.resendApiKeyEncrypted ?? null
            }
            const text = String(value)
            return isEncryptedSecret(text) ? text : encryptEmailSecret(text)
          },
        ],
      },
    },
    { type: 'text', name: 'welcomeSubjectVi', label: 'Subject VI' },
    { type: 'textarea', name: 'welcomeBodyVi', label: 'Body VI' },
    { type: 'text', name: 'welcomeSubjectEn', label: 'Subject EN' },
    { type: 'textarea', name: 'welcomeBodyEn', label: 'Body EN' },
  ],
}
