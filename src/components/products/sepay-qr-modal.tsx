'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { X, Loader2, CheckCircle } from 'lucide-react'
import { generateSepayQR } from '@/lib/payment/sepay-qr'

interface Props {
  orderId: string
  amountVND: number
  productName: string
  locale?: string
  onSuccess?: () => void
  onClose: () => void
}

/**
 * SePay VietQR payment modal.
 * Polls /api/payment/status every 5s to detect bank transfer confirmation.
 * Auto-expires after 15 minutes.
 */
export function SepayQRModal({
  orderId,
  amountVND,
  productName,
  locale = 'vi',
  onClose,
  onSuccess,
}: Props) {
  const isVi = locale === 'vi'
  const [status, setStatus] = useState<'pending' | 'success' | 'expired'>('pending')
  const qrData = generateSepayQR(orderId, amountVND)

  const checkPayment = useCallback(async () => {
    try {
      const res = await fetch(`/api/payment/status?orderId=${orderId}`)
      if (res.ok) {
        const data = (await res.json()) as { status: string }
        if (data.status === 'fulfilled' || data.status === 'paid') {
          setStatus('success')
          onSuccess?.()
        }
      }
    } catch {
      // Ignore transient polling errors
    }
  }, [orderId, onSuccess])

  useEffect(() => {
    const interval = setInterval(checkPayment, 5000)
    // Expire QR after 15 minutes
    const timeout = setTimeout(() => {
      setStatus('expired')
      clearInterval(interval)
    }, 15 * 60 * 1000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [checkPayment])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="motion-surface relative w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="font-heading font-semibold text-lg mb-1">
          {isVi ? 'Thanh toán VietQR' : 'VietQR Payment'}
        </h2>
        <p className="text-sm text-muted-foreground mb-4">{productName}</p>

        {status === 'success' ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
            <p className="font-medium">
              {isVi ? 'Thanh toán thành công!' : 'Payment successful!'}
            </p>
          </div>
        ) : status === 'expired' ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>
              {isVi
                ? 'QR code đã hết hạn. Vui lòng thử lại.'
                : 'QR code expired. Please try again.'}
            </p>
          </div>
        ) : (
          <>
            <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-white mb-4">
              <Image
                src={qrData.qrUrl}
                alt="VietQR"
                fill
                className="object-contain p-2"
                unoptimized
              />
            </div>
            <div className="text-center space-y-1 mb-4">
              <p className="font-bold text-xl text-primary">
                {new Intl.NumberFormat('vi-VN').format(amountVND)}₫
              </p>
              <p className="text-xs text-muted-foreground">
                {isVi ? 'Nội dung:' : 'Note:'}{' '}
                <span className="font-mono font-medium">{qrData.orderCode}</span>
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {isVi
                ? 'Đang chờ xác nhận thanh toán...'
                : 'Waiting for payment confirmation...'}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
