import type { EmailProvider, EmailProviderSendInput } from '../email-provider'
import { parseEmailAddress, readProviderError, renderEmailHtml } from './email-provider-utils'

export class CloudflareEmailProvider implements EmailProvider {
  constructor(
    private readonly apiToken: string | null,
    private readonly accountId: string | null,
    private readonly apiUrl: string,
  ) {}

  async send({ from, to, subject, react, replyTo }: EmailProviderSendInput) {
    if (!this.apiToken || !this.accountId) {
      throw new Error('Cloudflare Email Service API token and account ID are required when Cloudflare email provider is selected.')
    }

    const fromAddress = parseEmailAddress(from)
    const html = await renderEmailHtml(react)
    const response = await fetch(`${this.apiUrl.replace(/\/$/, '')}/accounts/${this.accountId}/email/sending/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: { email: fromAddress.email, name: fromAddress.name },
        to,
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to send email via Cloudflare Email Service: ${await readProviderError(response)}`)
    }

    const result = await response.json().catch(() => null) as { result?: { id?: string }; id?: string } | null
    return { id: result?.result?.id || result?.id }
  }
}
