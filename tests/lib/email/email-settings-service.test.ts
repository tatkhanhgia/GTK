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

  it('fails closed for unsupported provider values', async () => {
    payloadState.doc = { provider: 'smtp' }

    const { resolveEmailSettings } = await import('@/lib/email/email-settings-service')

    await expect(resolveEmailSettings()).rejects.toThrow('Unsupported email provider: smtp')
  })
})
