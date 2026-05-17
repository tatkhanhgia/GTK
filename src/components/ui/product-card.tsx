import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button-variants'
import { TechStackBadges } from '@/components/ui/tech-stack-badges'
import { cn, formatPrice } from '@/lib/utils'

interface Technology {
  name: string
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'ai' | 'other'
}

interface ProductCardProps {
  name: string
  slug: string
  excerpt?: string
  problemSolved?: string
  technologies?: Technology[]
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
  problemSolved,
  technologies,
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
    <article className="motion-card group flex flex-col overflow-hidden rounded-xl border border-border bg-card hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md">
      {/* Image */}
      <Link href={`/${locale}/products/${slug}`}>
        <div className="relative aspect-video overflow-hidden bg-muted">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt}
              fill
              className="motion-media object-cover group-hover:scale-103"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div
              aria-hidden="true"
              className="absolute inset-0 overflow-hidden bg-[linear-gradient(135deg,var(--background)_0%,var(--muted)_54%,color-mix(in_oklab,var(--primary)_16%,var(--background))_100%)]"
            >
              <div className="absolute left-5 top-8 h-24 w-24 rotate-[-5deg] rounded-xl border border-border/80 bg-card/80 shadow-sm" />
              <div className="absolute left-9 top-12 flex h-16 w-16 rotate-[-5deg] items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                <span className="font-heading text-xl font-bold text-primary">
                  {name[0]}
                </span>
              </div>
              <div className="absolute right-5 top-7 w-24 rounded-lg border border-border/70 bg-card/70 p-2 shadow-sm">
                <span className="mb-2 block h-1.5 w-10 rounded-full bg-primary/35" />
                <span className="mb-1.5 block h-1.5 rounded-full bg-foreground/14" />
                <span className="block h-1.5 w-4/5 rounded-full bg-foreground/10" />
              </div>
              <div className="absolute bottom-5 left-6 right-6 flex items-end gap-1.5 opacity-75">
                {[18, 30, 22, 38, 26, 34, 20].map((height, index) => (
                  <span
                    key={index}
                    className="w-full rounded-t-sm bg-primary/20"
                    style={{ height }}
                  />
                ))}
              </div>
            </div>
          )}
          {/* Type badge */}
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-background/90 px-2 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
              {typeLabels[type][locale as 'vi' | 'en']}
            </span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <Link href={`/${locale}/products/${slug}`}>
          <h2 className="line-clamp-2 font-heading text-base font-semibold leading-snug transition-colors hover:text-primary">
            {name}
          </h2>
        </Link>

        {excerpt && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {excerpt}
          </p>
        )}

        {problemSolved && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {locale === 'vi' ? 'Vấn đề:' : 'Problem:'}
            </span>{' '}
            {problemSolved}
          </p>
        )}

        {technologies && technologies.length > 0 && (
          <div className="mb-3 mt-auto pt-3">
            <TechStackBadges technologies={technologies} maxDisplay={4} />
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <span className="font-heading text-lg font-bold text-primary">
            {price}
          </span>
          {/* Use Link styled as button — base-nova Button has no asChild prop */}
          <Link
            href={`/${locale}/products/${slug}`}
            className={cn(buttonVariants({ size: 'sm' }), 'gap-2 touch-target')}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {locale === 'vi' ? 'Xem' : 'View'}
          </Link>
        </div>
      </div>
    </article>
  )
}
