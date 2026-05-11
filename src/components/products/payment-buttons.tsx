'use client'

import { useState } from 'react'
import { createStripeCheckout } from '@/lib/payment/stripe-checkout'
import { buttonVariants } from '@/components/ui/button'
import { cn, formatPrice } from '@/lib/utils'
import { CreditCard, QrCode, Loader2 } from 'lucide-react'

interface Props {
  productId: string
  productName: string
  priceUSD: number    // cents
  priceVND: number    // VND
  stripePriceId?: string
  locale?: string
  onSepayClick?: () => void
}

/**
 * Payment action buttons for a product.
 * Stripe: triggers server action (redirect to Stripe Checkout).
 * SePay: triggers parent-provided callback to open QR modal.
 */
export function PaymentButtons({
  productId,
  productName,
  priceUSD,
  priceVND,
  stripePriceId,
  locale = 'vi',
  onSepayClick,
}: Props) {
  const [stripeLoading, setStripeLoading] = useState(false)
  const isVi = locale === 'vi'

  async function handleStripe() {
    setStripeLoading(true)
    try {
      await createStripeCheckout({
        productId,
        productName,
        priceUSD,
        stripePriceId,
        locale,
      })
    } catch {
      // redirect() throws — catch only real errors
      setStripeLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <span className="font-heading font-bold text-2xl text-primary">
          {isVi ? formatPrice(priceVND, 'VND', locale) : formatPrice(priceUSD, 'USD', locale)}
        </span>
        <span className="text-sm text-muted-foreground">
          {isVi ? formatPrice(priceUSD, 'USD', 'en') : formatPrice(priceVND, 'VND', 'vi')}
        </span>
      </div>

      <button
        onClick={handleStripe}
        disabled={stripeLoading}
        className={cn(buttonVariants({ size: 'lg' }), 'w-full gap-2 motion-surface active:translate-y-px')}
      >
        {stripeLoading
          ? <Loader2 className="h-4 w-4 animate-spin" />
          : <CreditCard className="h-4 w-4" />}
        {isVi
          ? `Thanh toán Stripe (${formatPrice(priceUSD, 'USD', 'en')})`
          : `Pay with Stripe (${formatPrice(priceUSD, 'USD', 'en')})`}
      </button>

      {isVi && (
        <button
          type="button"
          onClick={onSepayClick}
          className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'w-full gap-2 motion-surface active:translate-y-px')}
        >
          <QrCode className="h-4 w-4" />
          {`Chuyển khoản VietQR (${formatPrice(priceVND, 'VND', 'vi')})`}
        </button>
      )}
    </div>
  )
}
