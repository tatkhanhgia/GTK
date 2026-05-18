import { afterEach, describe, expect, it, vi } from 'vitest'

const payloadState = vi.hoisted(() => ({
  doc: null as Record<string, unknown> | null,
  error: null as Error | null,
}))

vi.mock('@payload-config', () => ({ default: {} }))

vi.mock('payload', () => ({
  getPayload: vi.fn().mockResolvedValue({
    findGlobal: vi.fn(() => {
      if (payloadState.error) return Promise.reject(payloadState.error)
      return Promise.resolve(payloadState.doc)
    }),
  }),
}))

describe('email-settings-service', () => {
  afterEach(() => {
    payloadState.doc = null
    payloadState.error = null
    delete process.env.RESEND_API_KEY
    delete process.env.RESEND_FROM_EMAIL
    delete process.env.ZOHO_ZEPTOMAIL_TOKEN
    delete process.env.ZOHO_ZEPTOMAIL_API_URL
    delete process.env.SMTP_HOST
    delete process.env.SMTP_PORT
    delete process.env.SMTP_SECURE
    delete process.env.SMTP_USER
    delete process.env.SMTP_PASSWORD
    delete process.env.CLOUDFLARE_EMAIL_API_TOKEN
    delete process.env.CLOUDFLARE_ACCOUNT_ID
    delete process.env.CLOUDFLARE_EMAIL_API_URL
  })

  it('defaults missing provider to Resend and keeps env fallback', async () => {
    process.env.RESEND_API_KEY = 're_env'
    process.env.RESEND_FROM_EMAIL = 'noreply@example.com'

    const { resolveEmailSettings } = await import('@/lib/email/email-settings-service')
    const settings = await resolveEmailSettings()

    expect(settings.provider).toBe('resend')
    expect(settings.delivery).toEqual({ provider: 'resend', apiKey: 're_env' })
    expect(settings.from).toBe('GTKBlog <noreply@example.com>')
  })

  it('uses Resend values from Payload settings before env fallback', async () => {
    process.env.RESEND_API_KEY = 're_env'
    payloadState.doc = {
      provider: 'resend',
      resendApiKeyEncrypted: 're_payload',
      fromEmail: 'admin@example.com',
      fromName: 'Admin',
      replyTo: 'reply@example.com',
    }

    const { resolveEmailSettings } = await import('@/lib/email/email-settings-service')
    const settings = await resolveEmailSettings()

    expect(settings.delivery).toEqual({ provider: 'resend', apiKey: 're_payload' })
    expect(settings.from).toBe('Admin <admin@example.com>')
    expect(settings.replyTo).toBe('reply@example.com')
  })

  it('fails closed when the settings global cannot be read', async () => {
    process.env.RESEND_API_KEY = 're_env'
    payloadState.error = new Error('database unavailable')

    const { resolveEmailSettings } = await import('@/lib/email/email-settings-service')
    await expect(resolveEmailSettings()).rejects.toThrow(
      'Failed to resolve email settings: database unavailable',
    )
  })

  it('resolves Zoho settings with env fallback', async () => {
    process.env.ZOHO_ZEPTOMAIL_TOKEN = 'zoho_env'
    process.env.ZOHO_ZEPTOMAIL_API_URL = 'https://api.zoho.test/email'
    payloadState.doc = { provider: 'zoho', fromEmail: 'admin@example.com' }

    const { resolveEmailSettings } = await import('@/lib/email/email-settings-service')
    const settings = await resolveEmailSettings()

    expect(settings.provider).toBe('zoho')
    expect(settings.delivery).toEqual({
      provider: 'zoho',
      token: 'zoho_env',
      apiUrl: 'https://api.zoho.test/email',
    })
  })

  it('resolves Cloudflare settings with env fallback', async () => {
    process.env.CLOUDFLARE_EMAIL_API_TOKEN = 'cf_env'
    process.env.CLOUDFLARE_ACCOUNT_ID = 'account_1'
    payloadState.doc = { provider: 'cloudflare' }

    const { resolveEmailSettings } = await import('@/lib/email/email-settings-service')
    const settings = await resolveEmailSettings()

    expect(settings.provider).toBe('cloudflare')
    expect(settings.delivery).toEqual({
      provider: 'cloudflare',
      apiToken: 'cf_env',
      accountId: 'account_1',
      apiUrl: 'https://api.cloudflare.com/client/v4',
    })
  })

  it('resolves SMTP settings with env fallback', async () => {
    process.env.SMTP_HOST = 'smtp.zoho.com'
    process.env.SMTP_PORT = '587'
    process.env.SMTP_SECURE = 'false'
    process.env.SMTP_USER = 'contact@example.com'
    process.env.SMTP_PASSWORD = 'smtp_app_password'
    payloadState.doc = { provider: 'smtp', fromEmail: 'contact@example.com' }

    const { resolveEmailSettings } = await import('@/lib/email/email-settings-service')
    const settings = await resolveEmailSettings()

    expect(settings.provider).toBe('smtp')
    expect(settings.delivery).toEqual({
      provider: 'smtp',
      host: 'smtp.zoho.com',
      port: 587,
      secure: false,
      user: 'contact@example.com',
      password: 'smtp_app_password',
    })
  })

  it('uses SMTP env fallback when Payload only contains field defaults', async () => {
    process.env.SMTP_HOST = 'smtp.zoho.com'
    process.env.SMTP_PORT = '587'
    process.env.SMTP_SECURE = 'false'
    process.env.SMTP_USER = 'contact@example.com'
    process.env.SMTP_PASSWORD = 'smtp_app_password'
    payloadState.doc = {
      provider: 'smtp',
      fromEmail: 'contact@example.com',
      smtpHost: 'smtppro.zoho.com',
      smtpPort: 465,
      smtpSecure: true,
    }

    const { resolveEmailSettings } = await import('@/lib/email/email-settings-service')
    const settings = await resolveEmailSettings()

    expect(settings.delivery).toEqual({
      provider: 'smtp',
      host: 'smtp.zoho.com',
      port: 587,
      secure: false,
      user: 'contact@example.com',
      password: 'smtp_app_password',
    })
  })

  it('keeps explicit SMTP Payload values before env fallback', async () => {
    process.env.SMTP_HOST = 'smtp.env.example.com'
    process.env.SMTP_PORT = '465'
    process.env.SMTP_SECURE = 'true'
    process.env.SMTP_USER = 'env@example.com'
    process.env.SMTP_PASSWORD = 'env_password'
    payloadState.doc = {
      provider: 'smtp',
      fromEmail: 'contact@example.com',
      smtpHost: 'smtp.payload.example.com',
      smtpPort: 587,
      smtpSecure: false,
      smtpUser: 'payload@example.com',
      smtpPasswordEncrypted: 'payload_password',
    }

    const { resolveEmailSettings } = await import('@/lib/email/email-settings-service')
    const settings = await resolveEmailSettings()

    expect(settings.delivery).toEqual({
      provider: 'smtp',
      host: 'smtp.payload.example.com',
      port: 587,
      secure: false,
      user: 'payload@example.com',
      password: 'payload_password',
    })
  })

  it('fails closed for unsupported provider values', async () => {
    payloadState.doc = { provider: 'mailgun' }

    const { resolveEmailSettings } = await import('@/lib/email/email-settings-service')

    await expect(resolveEmailSettings()).rejects.toThrow('Unsupported email provider: mailgun')
  })
})
