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

    expect(settings.delivery.apiKey).toBe('re_payload')
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

  it('fails closed for unsupported provider values', async () => {
    payloadState.doc = { provider: 'zoho' }

    const { resolveEmailSettings } = await import('@/lib/email/email-settings-service')

    await expect(resolveEmailSettings()).rejects.toThrow('Unsupported email provider: zoho')
  })
})
