export const sepayConfig = {
  apiKey: process.env.SEPAY_API_KEY || '',
  webhookSecret: process.env.SEPAY_WEBHOOK_SECRET || '',
  bankAccount: process.env.SEPAY_BANK_ACCOUNT || '',
  bankAccountName: process.env.SEPAY_BANK_ACCOUNT_NAME || 'GTK Blog',
  bankName: process.env.SEPAY_BANK_NAME || 'MB Bank',
}

export interface SepayWebhookPayload {
  id: number
  gateway: string
  transactionDate: string
  accountNumber: string
  code: string | null
  content: string
  transferType: string
  description: string
  transferAmount: number
  referenceCode: string
  accumulated: number
  subAccount: string | null
}
