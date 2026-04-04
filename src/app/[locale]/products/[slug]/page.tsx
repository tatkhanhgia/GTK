import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getProductBySlug } from '@/lib/products/get-product-by-slug'
import { ProductPaymentSection } from '@/components/products/product-payment-section'
import { RichTextRenderer } from '@/components/blog/rich-text-renderer'
import type { Locale } from '@/i18n/config'
import type { Metadata } from 'next'
import { Check } from 'lucide-react'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const product = await getProductBySlug(slug, locale as Locale)
  if (!product) return { title: 'Product Not Found' }
  const name = typeof product.name === 'string' ? product.name : String(product.name)
  return { title: name }
}

const typeMap: Record<string, { vi: string; en: string }> = {
  ebook: { vi: 'Ebook', en: 'Ebook' },
  template: { vi: 'Template', en: 'Template' },
  code: { vi: 'Source Code', en: 'Source Code' },
}

export default async function ProductDetailPage({ params }: Props) {
  const { locale, slug } = await params
  const loc = locale as Locale
  const product = await getProductBySlug(slug, loc)
  if (!product) notFound()

  const isVi = loc === 'vi'
  const name = typeof product.name === 'string' ? product.name : String(product.name)
  const excerpt = typeof product.excerpt === 'string' ? product.excerpt : undefined
  const features = Array.isArray(product.features) ? product.features : []

  const firstImageBlock = Array.isArray(product.images) && product.images[0]
    ? (product.images[0] as { image: unknown }).image
    : null
  const firstImage =
    firstImageBlock && typeof firstImageBlock === 'object'
      ? { url: (firstImageBlock as { url?: string }).url ?? '', alt: name }
      : null

  const typeLabel = typeMap[product.type]?.[isVi ? 'vi' : 'en'] ?? product.type

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Product image */}
        <div className="aspect-video relative rounded-xl overflow-hidden bg-muted">
          {firstImage?.url ? (
            <Image
              src={firstImage.url}
              alt={firstImage.alt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="absolute inset-0 gradient-brand opacity-60 flex items-center justify-center">
              <span className="font-heading font-bold text-white text-4xl">{name[0]}</span>
            </div>
          )}
        </div>

        {/* Product info + payment */}
        <div>
          <div className="inline-block px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium mb-4">
            {typeLabel}
          </div>
          <h1 className="font-heading font-bold text-3xl mb-3">{name}</h1>
          {excerpt && (
            <p className="text-muted-foreground mb-6 leading-relaxed">{excerpt}</p>
          )}

          {features.length > 0 && (
            <ul className="space-y-2 mb-8">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-success shrink-0" />
                  {typeof f === 'string'
                    ? f
                    : (f as { feature?: string }).feature ?? ''}
                </li>
              ))}
            </ul>
          )}

          <ProductPaymentSection
            orderId={null}
            productId={String(product.id)}
            productName={name}
            priceUSD={product.priceUSD}
            priceVND={product.priceVND}
            stripePriceId={product.stripePriceId ?? undefined}
            locale={loc}
          />
        </div>
      </div>

      {/* Rich text description */}
      {product.description && (
        <div className="mt-16">
          <h2 className="font-heading font-semibold text-xl mb-6">
            {isVi ? 'Mô tả' : 'Description'}
          </h2>
          <div className="prose-custom">
            <RichTextRenderer content={product.description} />
          </div>
        </div>
      )}
    </div>
  )
}
