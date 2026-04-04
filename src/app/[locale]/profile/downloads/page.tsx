import { getSession } from '@/lib/auth/auth-helpers'
import { getUserDownloads } from '@/lib/profile/get-user-downloads'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Download, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Locale } from '@/i18n/config'

interface Props {
  params: Promise<{ locale: string }>
}

/**
 * Downloads page — lists all non-revoked download tokens enriched with
 * product names fetched from Payload CMS.
 * Auth guard is in the parent profile layout.
 */
export default async function DownloadsPage({ params }: Props) {
  const { locale } = await params
  const isVi = locale === 'vi'
  const session = await getSession()
  if (!session) return null

  const downloads = await getUserDownloads(session.user.id)

  // Enrich each token with its product name from Payload CMS
  const payload = await getPayload({ config })
  const enriched = await Promise.all(
    downloads.map(async (d) => {
      try {
        const product = await payload.findByID({
          collection: 'products',
          id: d.productId,
          depth: 0,
          locale: locale as Locale,
        })
        const name =
          typeof product?.name === 'string' ? product.name : String(product?.name ?? 'Product')
        return { ...d, productName: name }
      } catch {
        // Product not found or DB unavailable — fall back to generic label
        return { ...d, productName: 'Product' }
      }
    })
  )

  const now = new Date()

  return (
    <div>
      <h2 className="font-heading font-semibold text-xl mb-6">
        {isVi ? 'Tải xuống của bạn' : 'Your Downloads'}
      </h2>

      {enriched.length === 0 ? (
        <p className="text-muted-foreground text-sm py-8 text-center">
          {isVi ? 'Bạn chưa mua sản phẩm nào.' : 'No downloads yet.'}
        </p>
      ) : (
        <div className="space-y-4">
          {enriched.map((d) => {
            const isExpired = d.expiresAt < now
            return (
              <div
                key={d.token}
                className="rounded-xl border border-border bg-card p-5 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-medium text-sm">{d.productName}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {isExpired
                      ? isVi
                        ? 'Đã hết hạn'
                        : 'Expired'
                      : `${isVi ? 'Hết hạn' : 'Expires'}: ${formatDate(d.expiresAt.toISOString(), locale)}`}
                  </p>
                </div>

                {!isExpired ? (
                  <a
                    href={`/api/download/${d.token}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <Download className="h-4 w-4" />
                    {isVi ? 'Tải xuống' : 'Download'}
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {isVi ? 'Liên hệ hỗ trợ để gia hạn' : 'Contact support to renew'}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
