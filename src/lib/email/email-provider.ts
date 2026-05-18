import type { ReactElement } from 'react'
import { CloudflareEmailProvider } from './providers/cloudflare-email-provider'
import { ResendEmailProvider } from './providers/resend-email-provider'
import { SmtpEmailProvider } from './providers/smtp-email-provider'
import { ZohoEmailProvider } from './providers/zoho-email-provider'
import type { ResolvedEmailSettings } from './email-settings-service'

export interface EmailProviderSendInput {
  to: string[]
  from: string
  replyTo?: string
  subject: string
  react: ReactElement
}

export interface EmailProvider {
  send(input: EmailProviderSendInput): Promise<{ id?: string } | null>
}

export function createEmailProvider(settings: ResolvedEmailSettings): EmailProvider {
  if (settings.delivery.provider === 'resend') {
    return new ResendEmailProvider(settings.delivery.apiKey || undefined)
  }

  if (settings.delivery.provider === 'zoho') {
    return new ZohoEmailProvider(settings.delivery.token, settings.delivery.apiUrl)
  }

  if (settings.delivery.provider === 'smtp') {
    return new SmtpEmailProvider(settings.delivery)
  }

  if (settings.delivery.provider === 'cloudflare') {
    return new CloudflareEmailProvider(
      settings.delivery.apiToken,
      settings.delivery.accountId,
      settings.delivery.apiUrl,
    )
  }

  throw new Error(`Unsupported email provider: ${settings.provider}`)
}
