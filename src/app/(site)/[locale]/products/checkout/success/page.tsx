import { CheckCircle, Download } from 'lucide-react'
import Link from 'next/link'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ session_id?: string }>
}

export default async function CheckoutSuccessPage({ params }: Props) {
  const { locale } = await params
  const isVi = locale === 'vi'

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
        <h1 className="font-heading font-bold text-2xl mb-3">
          {isVi ? 'Thanh toán thành công!' : 'Payment Successful!'}
        </h1>
        <p className="text-muted-foreground mb-8">
          {isVi
            ? 'Cảm ơn bạn đã mua hàng. Liên kết tải xuống đã được gửi đến email của bạn.'
            : 'Thank you for your purchase. Download link has been sent to your email.'}
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href={`/${locale}/profile/downloads`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <Download className="h-4 w-4" />
            {isVi ? 'Tải xuống' : 'Downloads'}
          </Link>
          <Link
            href={`/${locale}/products`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm hover:bg-secondary/80 transition-colors"
          >
            {isVi ? 'Xem thêm' : 'Browse more'}
          </Link>
        </div>
      </div>
    </div>
  )
}
