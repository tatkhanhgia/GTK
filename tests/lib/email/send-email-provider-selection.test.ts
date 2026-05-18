import { afterEach, describe, expect, it, vi } from 'vitest'
import { createElement, type ReactElement } from 'react'

const resendSend = vi.hoisted(() => vi.fn())
const testEmail = () => createElement('div', null, 'Hello') as ReactElement
const settingsState = vi.hoisted(() => ({
  settings: {
    enabled: true,
    welcomeEmailEnabled: true,
    provider: 'resend',
    delivery: { provider: 'resend', apiKey: 're_payload' },
    fromEmail: 'noreply@example.com',
    fromName: 'GTKBlog',
    from: 'GTKBlog <noreply@example.com>',
    welcome: {
      vi: { subject: 'Chao mung', body: 'Xin chao' },
      en: { subject: 'Welcome', body: 'Hello' },
    },
  } as Record<string, unknown>,
}))

vi.mock('@/lib/email/email-settings-service', () => ({
  resolveEmailSettings: vi.fn(() => Promise.resolve(settingsState.settings)),
}))

vi.mock('@/lib/email/resend-client', () => ({
  FROM_EMAIL: 'noreply@gtkblog.com',
  getResendClient: vi.fn(() => ({
    emails: { send: resendSend },
  })),
}))

describe('send-email provider selection', () => {
  afterEach(() => {
    resendSend.mockReset()
    vi.unstubAllGlobals()
    settingsState.settings = {
      enabled: true,
      welcomeEmailEnabled: true,
      provider: 'resend',
      delivery: { provider: 'resend', apiKey: 're_payload' },
      fromEmail: 'noreply@example.com',
      fromName: 'GTKBlog',
      from: 'GTKBlog <noreply@example.com>',
      welcome: {
        vi: { subject: 'Chao mung', body: 'Xin chao' },
        en: { subject: 'Welcome', body: 'Hello' },
      },
    }
  })

  it('sends through the selected Resend provider', async () => {
    resendSend.mockResolvedValue({ data: { id: 'email-1' }, error: null })
    const react = testEmail()

    const { sendEmail } = await import('@/lib/email/send-email')
    const result = await sendEmail({ to: 'user@example.com', subject: 'Subject', react })

    expect(result).toEqual({ id: 'email-1' })
    expect(resendSend).toHaveBeenCalledWith({
      from: 'GTKBlog <noreply@example.com>',
      to: ['user@example.com'],
      subject: 'Subject',
      react,
    })
  })

  it('does not send when email delivery is disabled', async () => {
    settingsState.settings = { ...settingsState.settings, enabled: false }

    const { sendEmail } = await import('@/lib/email/send-email')
    const result = await sendEmail({
      to: 'user@example.com',
      subject: 'Subject',
      react: testEmail(),
    })

    expect(result).toBeNull()
    expect(resendSend).not.toHaveBeenCalled()
  })

  it('fails closed for unsupported provider configs', async () => {
    settingsState.settings = {
      ...settingsState.settings,
      provider: 'smtp',
      delivery: { provider: 'smtp' },
    }

    const { sendEmail } = await import('@/lib/email/send-email')

    await expect(sendEmail({
      to: 'user@example.com',
      subject: 'Subject',
      react: testEmail(),
    })).rejects.toThrow('Unsupported email provider: smtp')
    expect(resendSend).not.toHaveBeenCalled()
  })

  it('sends through Zoho ZeptoMail provider', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [{ message_id: 'zoho-1' }] }),
    })
    vi.stubGlobal('fetch', fetchMock)
    settingsState.settings = {
      ...settingsState.settings,
      provider: 'zoho',
      delivery: { provider: 'zoho', token: 'zoho_token', apiUrl: 'https://api.zoho.test/email' },
    }

    const { sendEmail } = await import('@/lib/email/send-email')
    const result = await sendEmail({
      to: 'user@example.com',
      subject: 'Subject',
      react: testEmail(),
    })

    expect(result).toEqual({ id: 'zoho-1' })
    expect(fetchMock).toHaveBeenCalledWith('https://api.zoho.test/email', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ Authorization: 'Zoho-enczapikey zoho_token' }),
    }))
    const [, zohoRequest] = fetchMock.mock.calls[0]
    const zohoBody = JSON.parse(String(zohoRequest.body))
    expect(zohoBody).toMatchObject({
      from: { address: 'noreply@example.com', name: 'GTKBlog' },
      to: [{ email_address: { address: 'user@example.com' } }],
      subject: 'Subject',
    })
    expect(zohoBody.htmlbody).toContain('Hello')
  })

  it('sends through Cloudflare Email Service provider', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ result: { id: 'cf-1' } }),
    })
    vi.stubGlobal('fetch', fetchMock)
    settingsState.settings = {
      ...settingsState.settings,
      provider: 'cloudflare',
      delivery: {
        provider: 'cloudflare',
        apiToken: 'cf_token',
        accountId: 'account_1',
        apiUrl: 'https://api.cloudflare.test/client/v4/',
      },
    }

    const { sendEmail } = await import('@/lib/email/send-email')
    const result = await sendEmail({
      to: 'user@example.com',
      subject: 'Subject',
      react: testEmail(),
    })

    expect(result).toEqual({ id: 'cf-1' })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.cloudflare.test/client/v4/accounts/account_1/email/sending/send',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer cf_token' }),
      }),
    )
    const [, cloudflareRequest] = fetchMock.mock.calls[0]
    const cloudflareBody = JSON.parse(String(cloudflareRequest.body))
    expect(cloudflareBody).toMatchObject({
      from: { email: 'noreply@example.com', name: 'GTKBlog' },
      to: ['user@example.com'],
      subject: 'Subject',
    })
    expect(cloudflareBody.html).toContain('Hello')
  })
})
