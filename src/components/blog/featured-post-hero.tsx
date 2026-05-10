import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock } from 'lucide-react'
import { CategoryBadge } from '@/components/ui/category-badge'
import { formatDate, readingTimeLabel } from '@/lib/utils'

interface FeaturedPostHeroProps {
  title: string
  slug: string
  excerpt?: string
  featuredImage?: { url: string; alt: string } | null
  category?: { name: string; slug: string } | null
  publishedAt?: string | null
  readingTime?: number | null
  locale: string
}

export function FeaturedPostHero({
  title,
  slug,
  excerpt,
  featuredImage,
  category,
  publishedAt,
  readingTime,
  locale,
}: FeaturedPostHeroProps) {
  const isVi = locale === 'vi'

  return (
    <Link href={`/${locale}/blog/${slug}`} className="group mb-10 block">
      <article className="relative overflow-hidden rounded-3xl border border-border/60 bg-card">
        <div className="relative aspect-video md:aspect-[21/9] overflow-hidden bg-secondary">
          {featuredImage?.url ? (
            <Image
              src={featuredImage.url}
              alt={featuredImage.alt}
              fill
              className="motion-media object-cover group-hover:scale-103"
              sizes="(max-width: 768px) 100vw, 1200px"
            />
          ) : (
            <div className="gradient-brand-subtle absolute inset-0" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-white/70">
              {isVi ? 'Bài viết nổi bật' : 'Featured post'}
            </p>
            {category && (
              <div className="mt-3">
                <CategoryBadge
                  name={category.name}
                  slug={category.slug}
                  locale={locale}
                  asLink={false}
                  className="border border-white/15 bg-white/10 text-white hover:bg-white/10"
                />
              </div>
            )}
            <h2 className="mt-4 max-w-3xl font-heading text-2xl font-bold leading-tight text-white md:text-4xl">
              {title}
            </h2>
            {excerpt && (
              <p className="mt-3 max-w-2xl line-clamp-2 text-sm leading-relaxed text-white/80 md:text-base">
                {excerpt}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-white/70 md:text-sm">
              {publishedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formatDate(publishedAt, locale)}
                </span>
              )}
              {readingTime ? (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {readingTimeLabel(readingTime, locale)}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
