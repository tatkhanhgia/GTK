import type { ReactElement } from 'react'
import { ResendEmailProvider } from './providers/resend-email-provider'
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

  throw new Error(`Unsupported email provider: ${settings.provider}`)
}
