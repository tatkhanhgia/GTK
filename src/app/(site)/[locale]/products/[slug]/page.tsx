import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getProductBySlug } from '@/lib/products/get-product-by-slug'
import { ProductPaymentSection } from '@/components/products/product-payment-section'
import { RichTextRenderer } from '@/components/blog/rich-text-renderer'
import { TechStackBadges } from '@/components/ui/tech-stack-badges'
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

  // Helper to get localized text
  function getLocalizedText(value: unknown): string | undefined {
    if (typeof value === 'string') return value
    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>
      const localized = record[loc]
      if (typeof localized === 'string') return localized
      const first = Object.values(record).find((item) => typeof item === 'string')
      if (typeof first === 'string') return first
    }
    return undefined
  }

  const problemSolvedText = getLocalizedText(product.problemSolved)
  const technologies = Array.isArray(product.technologies)
    ? product.technologies.map((t: unknown) => {
        if (!t || typeof t !== 'object') return null
        const tech = t as Record<string, unknown>
        return {
          name: typeof tech.name === 'string' ? tech.name : '',
          category: (typeof tech.category === 'string' ? tech.category : 'other') as 'frontend' | 'backend' | 'database' | 'devops' | 'ai' | 'other',
        }
      }).filter((t): t is { name: string; category: 'frontend' | 'backend' | 'database' | 'devops' | 'ai' | 'other' } => !!t?.name)
    : []

  const keyFeatures: { title: string; description?: string }[] = (Array.isArray(product.keyFeatures) ? product.keyFeatures : [])
    .map((f: unknown) => {
      if (!f || typeof f !== 'object') return null
      const feature = f as Record<string, unknown>
      const title = getLocalizedText(feature.title)
      const description = getLocalizedText(feature.description)
      if (!title) return null
      const result: { title: string; description?: string } = { title }
      if (description) result.description = description
      return result
    })
    .filter((f): f is { title: string; description?: string } => f !== null)

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

      {/* Problem Solved */}
      {problemSolvedText && (
        <div className="mt-10 rounded-2xl border border-border bg-secondary/30 p-6 md:p-8">
          <h2 className="mb-3 font-heading text-xl font-semibold">
            {isVi ? 'Vấn đề được giải quyết' : 'Problem Solved'}
          </h2>
          <p className="text-muted-foreground">{problemSolvedText}</p>
        </div>
      )}

      {/* Tech Stack */}
      {technologies.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 font-heading text-xl font-semibold">
            {isVi ? 'Công nghệ sử dụng' : 'Tech Stack'}
          </h2>
          <TechStackBadges technologies={technologies} />
        </div>
      )}

      {/* Key Features */}
      {keyFeatures.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 font-heading text-xl font-semibold">
            {isVi ? 'Tính năng chính' : 'Key Features'}
          </h2>
          <ul className="space-y-4">
            {keyFeatures.map((feature) => (
              <li key={feature.title} className="flex gap-3">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                <div>
                  <p className="font-medium">{feature.title}</p>
                  {feature.description && (
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
