import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ReactElement } from 'react'

const resendSend = vi.hoisted(() => vi.fn())
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
    const react = { type: 'div', props: {}, key: null } as unknown as ReactElement

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
      react: { type: 'div', props: {}, key: null } as unknown as ReactElement,
    })

    expect(result).toBeNull()
    expect(resendSend).not.toHaveBeenCalled()
  })

  it('fails closed for unsupported provider configs', async () => {
    settingsState.settings = {
      ...settingsState.settings,
      provider: 'cloudflare',
      delivery: { provider: 'cloudflare' },
    }

    const { sendEmail } = await import('@/lib/email/send-email')

    await expect(sendEmail({
      to: 'user@example.com',
      subject: 'Subject',
      react: { type: 'div', props: {}, key: null } as unknown as ReactElement,
    })).rejects.toThrow('Unsupported email provider: cloudflare')
    expect(resendSend).not.toHaveBeenCalled()
  })
})
