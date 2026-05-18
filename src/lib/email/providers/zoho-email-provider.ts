import type { EmailProvider, EmailProviderSendInput } from '../email-provider'
import { parseEmailAddress, readProviderError, renderEmailHtml } from './email-provider-utils'

export class ZohoEmailProvider implements EmailProvider {
  constructor(
    private readonly token: string | null,
    private readonly apiUrl: string,
  ) {}

  async send({ from, to, subject, react, replyTo }: EmailProviderSendInput) {
    if (!this.token) {
      throw new Error('Zoho ZeptoMail token is required when Zoho email provider is selected.')
    }

    const fromAddress = parseEmailAddress(from)
    const htmlbody = await renderEmailHtml(react)
    const authorization = /^zoho-/i.test(this.token) ? this.token : `Zoho-enczapikey ${this.token}`

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        Authorization: authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: { address: fromAddress.email, name: fromAddress.name },
        to: to.map((address) => ({ email_address: { address } })),
        subject,
        htmlbody,
        ...(replyTo ? { reply_to: [{ address: replyTo }] } : {}),
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to send email via Zoho ZeptoMail: ${await readProviderError(response)}`)
    }

    const result = await response.json().catch(() => null) as {
      data?: { message_id?: string; request_id?: string }[]
      message_id?: string
      request_id?: string
    } | null
    return { id: result?.message_id || result?.request_id || result?.data?.[0]?.message_id || result?.data?.[0]?.request_id }
  }
}
