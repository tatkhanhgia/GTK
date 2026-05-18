import nodemailer from 'nodemailer'
import type { EmailProvider, EmailProviderSendInput } from '../email-provider'
import type { EmailDeliverySettings } from '../email-settings-service'
import { renderEmailHtml } from './email-provider-utils'

type SmtpDeliverySettings = Extract<EmailDeliverySettings, { provider: 'smtp' }>

export class SmtpEmailProvider implements EmailProvider {
  constructor(private readonly settings: SmtpDeliverySettings) {}

  async send({ from, to, subject, react, replyTo }: EmailProviderSendInput) {
    if (!this.settings.host || !this.settings.user || !this.settings.password) {
      throw new Error('SMTP host, username, and password are required when SMTP email provider is selected.')
    }

    const transport = nodemailer.createTransport({
      host: this.settings.host,
      port: this.settings.port,
      secure: this.settings.secure,
      auth: {
        user: this.settings.user,
        pass: this.settings.password,
      },
    })

    const info = await transport.sendMail({
      from,
      to,
      subject,
      html: await renderEmailHtml(react),
      ...(replyTo ? { replyTo } : {}),
    })

    return { id: info.messageId }
  }
}
