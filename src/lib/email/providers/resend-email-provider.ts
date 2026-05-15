import { getResendClient } from '../resend-client'
import type { EmailProvider, EmailProviderSendInput } from '../email-provider'

export class ResendEmailProvider implements EmailProvider {
  constructor(private readonly apiKey?: string) {}

  async send({ from, to, subject, react, replyTo }: EmailProviderSendInput) {
    const resend = getResendClient(this.apiKey)
    const result = await resend.emails.send({
      from,
      to,
      subject,
      react,
      ...(replyTo ? { replyTo } : {}),
    })

    if (result.error) {
      throw new Error(`Failed to send email via Resend: ${result.error.message}`)
    }

    return result.data
  }
}
