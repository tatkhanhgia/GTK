'use client'

import { useState } from 'react'
import { PaymentButtons } from './payment-buttons'
import { SepayQRModal } from './sepay-qr-modal'
import { useRouter } from 'next/navigation'

interface Props {
  orderId: string | null // pre-created SePay order ID (null until user clicks VietQR)
  productId: string
  productName: string
  priceUSD: number
  priceVND: number
  stripePriceId?: string
  locale: string
}

/**
 * Client wrapper that composes PaymentButtons + SepayQRModal.
 * Manages the SePay QR modal open/close state.
 * The parent server component passes a pre-created order ID for SePay.
 */
export function ProductPaymentSection({
  productId,
  productName,
  priceUSD,
  priceVND,
  stripePriceId,
  locale,
}: Props) {
  const [sepayOrderId, setSepayOrderId] = useState<string | null>(null)
  const [showQR, setShowQR] = useState(false)
  const router = useRouter()

  async function handleSepayClick() {
    // Create a SePay order via API, then show QR
    try {
      const res = await fetch('/api/payment/create-sepay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, productName, priceVND }),
      })
      if (res.ok) {
        const data = (await res.json()) as { orderId: string }
        setSepayOrderId(data.orderId)
        setShowQR(true)
      }
    } catch {
      // Error creating order — silently ignore, user can retry
    }
  }

  function handleSuccess() {
    router.push(`/${locale}/products/checkout/success`)
  }

  return (
    <>
      <PaymentButtons
        productId={productId}
        productName={productName}
        priceUSD={priceUSD}
        priceVND={priceVND}
        stripePriceId={stripePriceId}
        locale={locale}
        onSepayClick={handleSepayClick}
      />

      {showQR && sepayOrderId && (
        <SepayQRModal
          orderId={sepayOrderId}
          amountVND={priceVND}
          productName={productName}
          locale={locale}
          onSuccess={handleSuccess}
          onClose={() => setShowQR(false)}
        />
      )}
    </>
  )
}
