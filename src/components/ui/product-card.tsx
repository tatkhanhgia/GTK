import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn, formatPrice } from '@/lib/utils'

interface ProductCardProps {
  name: string
  slug: string
  excerpt?: string
  image?: {
    url: string
    alt: string
  } | null
  priceUSD: number
  priceVND: number
  type: 'ebook' | 'template' | 'code'
  locale?: string
}

const typeLabels: Record<ProductCardProps['type'], { vi: string; en: string }> = {
  ebook: { vi: 'Ebook', en: 'Ebook' },
  template: { vi: 'Template', en: 'Template' },
  code: { vi: 'Source Code', en: 'Source Code' },
}

export function ProductCard({
  name,
  slug,
  excerpt,
  image,
  priceUSD,
  priceVND,
  type,
  locale = 'vi',
}: ProductCardProps) {
  const price = locale === 'vi'
    ? formatPrice(priceVND, 'VND', locale)
    : formatPrice(priceUSD, 'USD', locale)

  return (
    <article className="group rounded-xl border border-border bg-card overflow-hidden transition-all duration-250 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20">
      {/* Image */}
      <Link href={`/${locale}/products/${slug}`}>
        <div className="aspect-video relative overflow-hidden bg-muted">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt}
              fill
              className="object-cover transition-transform duration-400 group-hover:scale-103"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 gradient-brand opacity-60 flex items-center justify-center">
              <span className="font-heading font-bold text-white text-lg">{name[0]}</span>
            </div>
          )}
          {/* Type badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-background/90 text-foreground backdrop-blur-sm">
              {typeLabels[type][locale as 'vi' | 'en']}
            </span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-5">
        <Link href={`/${locale}/products/${slug}`}>
          <h2 className="font-heading font-semibold text-base leading-snug line-clamp-2 hover:text-primary transition-colors">
            {name}
          </h2>
        </Link>

        {excerpt && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {excerpt}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="font-heading font-bold text-lg text-primary">
            {price}
          </span>
          {/* Use Link styled as button — base-nova Button has no asChild prop */}
          <Link
            href={`/${locale}/products/${slug}`}
            className={cn(buttonVariants({ size: 'sm' }), 'gap-2')}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {locale === 'vi' ? 'Xem' : 'View'}
          </Link>
        </div>
      </div>
    </article>
  )
}
