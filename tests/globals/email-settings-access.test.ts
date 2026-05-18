import { afterEach, describe, expect, it } from 'vitest'
import { EmailSettings } from '@/globals/email-settings'

const resendKeyField = EmailSettings.fields.find((field) => 'name' in field && field.name === 'resendApiKeyEncrypted')
const zohoTokenField = EmailSettings.fields.find((field) => 'name' in field && field.name === 'zohoTokenEncrypted')
const cloudflareTokenField = EmailSettings.fields.find((field) => 'name' in field && field.name === 'cloudflareApiTokenEncrypted')

describe('email-settings global access', () => {
  afterEach(() => {
    delete process.env.PAYLOAD_SECRET
    delete process.env.RESEND_API_KEY
    delete process.env.ZOHO_ZEPTOMAIL_TOKEN
    delete process.env.CLOUDFLARE_EMAIL_API_TOKEN
  })

  it('allows admins to manage email settings', async () => {
    const canUpdate = await EmailSettings.access?.update?.({
      req: { user: { id: 'admin-1', role: 'admin' } },
    } as never)

    expect(canUpdate).toBe(true)
  })

  it('denies editors access to email secret settings', async () => {
    const canRead = await EmailSettings.access?.read?.({
      req: { user: { id: 'editor-1', role: 'editor' } },
    } as never)

    expect(canRead).toBe(false)
  })

  it('masks the stored Resend secret for normal admin reads', () => {
    const afterRead = EmailSettings.hooks?.afterRead?.[0]
    const doc = {
      resendApiKeyEncrypted: 'enc:v1:stored-secret',
      zohoTokenEncrypted: 'enc:v1:zoho-secret',
      cloudflareApiTokenEncrypted: 'enc:v1:cf-secret',
    }

    const result = afterRead?.({ doc, context: {} } as never)

    expect(result).toMatchObject({
      resendApiKeyEncrypted: '********',
      zohoTokenEncrypted: '********',
      cloudflareApiTokenEncrypted: '********',
    })
  })

  it('preserves the stored Resend secret when a masked value is saved', () => {
    const beforeChange = resendKeyField && 'hooks' in resendKeyField
      ? resendKeyField.hooks?.beforeChange?.[0]
      : undefined

    const result = beforeChange?.({
      value: '********',
      originalDoc: { resendApiKeyEncrypted: 'enc:v1:stored-secret' },
    } as never)

    expect(result).toBe('enc:v1:stored-secret')
  })

  it('encrypts a newly entered Resend secret before saving', () => {
    process.env.PAYLOAD_SECRET = 'test-secret'
    const beforeChange = resendKeyField && 'hooks' in resendKeyField
      ? resendKeyField.hooks?.beforeChange?.[0]
      : undefined

    const result = beforeChange?.({
      value: 're_new_key',
      originalDoc: {},
    } as never)

    expect(result).toEqual(expect.stringMatching(/^enc:v1:/))
    expect(result).not.toContain('re_new_key')
  })

  it('requires a Resend key when email sending has no env fallback', () => {
    const validate = resendKeyField && 'validate' in resendKeyField
      ? resendKeyField.validate as (value: string, options: Record<string, unknown>) => true | string
      : undefined

    const result = validate?.('', {
      siblingData: { enabled: true, provider: 'resend' },
    } as never)

    expect(result).toBe('Resend API key is required when email sending is enabled.')
  })

  it('requires provider-specific secrets when selected without env fallback', () => {
    const zohoValidate = zohoTokenField && 'validate' in zohoTokenField
      ? zohoTokenField.validate as (value: string, options: Record<string, unknown>) => true | string
      : undefined
    const cloudflareValidate = cloudflareTokenField && 'validate' in cloudflareTokenField
      ? cloudflareTokenField.validate as (value: string, options: Record<string, unknown>) => true | string
      : undefined

    expect(zohoValidate?.('', {
      siblingData: { enabled: true, provider: 'zoho' },
    } as never)).toBe('Zoho ZeptoMail token is required when Zoho email provider is enabled.')

    expect(cloudflareValidate?.('', {
      siblingData: { enabled: true, provider: 'cloudflare' },
    } as never)).toBe('Cloudflare Email API token is required when Cloudflare email provider is enabled.')
  })
})
