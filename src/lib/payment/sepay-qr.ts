import { sepayConfig } from './sepay-config'

export interface SepayQRData {
  qrUrl: string
  orderCode: string
  amount: number
}

/**
 * Generate a VietQR URL for SePay bank transfer payment.
 * Uses the VietQR CDN for QR image generation.
 */
export function generateSepayQR(orderId: string, amountVND: number): SepayQRData {
  const orderCode = `GTKBLOG-${orderId.slice(-8).toUpperCase()}`
  const description = encodeURIComponent(`Thanh toan ${orderCode}`)

  // VietQR CDN format: /image/{BANK}-{ACCOUNT}-{TEMPLATE}.jpg?amount={AMOUNT}&addInfo={DESC}
  const bankCode = sepayConfig.bankName.replace(/\s+/g, '').toUpperCase()
  const qrUrl = `https://img.vietqr.io/image/${bankCode}-${sepayConfig.bankAccount}-compact2.jpg?amount=${amountVND}&addInfo=${description}&accountName=${encodeURIComponent(sepayConfig.bankAccountName)}`

  return { qrUrl, orderCode, amount: amountVND }
}
