import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock } from 'lucide-react'
import { formatDate, readingTimeLabel } from '@/lib/utils'
import { CategoryBadge } from './category-badge'

interface BlogCardProps {
  title: string
  slug: string
  excerpt?: string
  featuredImage?: {
    url: string
    alt: string
  } | null
  category?: {
    name: string
    slug: string
  } | null
  publishedAt?: string | null
  readingTime?: number | null
  locale?: string
}

export function BlogCard({
  title,
  slug,
  excerpt,
  featuredImage,
  category,
  publishedAt,
  readingTime,
  locale = 'vi',
}: BlogCardProps) {
  return (
    <article className="motion-card group overflow-hidden rounded-xl border border-border bg-card hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md">
      {/* Thumbnail */}
      <Link href={`/${locale}/blog/${slug}`}>
        <div className="aspect-video relative overflow-hidden bg-muted">
          {featuredImage ? (
            <Image
              src={featuredImage.url}
              alt={featuredImage.alt}
              fill
              className="motion-media object-cover group-hover:scale-103"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div
              aria-hidden="true"
              className="absolute inset-0 overflow-hidden bg-[linear-gradient(135deg,var(--muted)_0%,var(--background)_48%,color-mix(in_oklab,var(--primary)_18%,var(--background))_100%)]"
            >
              <div className="absolute left-5 top-5 right-5 rounded-lg border border-border/80 bg-card/70 p-3 shadow-sm">
                <div className="mb-3 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary/70" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/20" />
                </div>
                <div className="space-y-2">
                  <span className="block h-2 rounded-full bg-foreground/18" />
                  <span className="block h-2 w-4/5 rounded-full bg-foreground/12" />
                  <span className="block h-2 w-2/3 rounded-full bg-primary/25" />
                </div>
              </div>
              <div className="absolute bottom-4 left-5 right-9 grid grid-cols-6 gap-1.5 opacity-75">
                {Array.from({ length: 18 }).map((_, index) => (
                  <span
                    key={index}
                    className="h-1.5 rounded-full bg-foreground/10"
                  />
                ))}
              </div>
              <div className="absolute -bottom-8 -right-8 h-28 w-28 rounded-full border border-primary/20" />
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-5">
        {category && (
          <div className="mb-3">
            <CategoryBadge name={category.name} slug={category.slug} locale={locale} />
          </div>
        )}

        <Link href={`/${locale}/blog/${slug}`}>
          <h2 className="font-heading font-semibold text-lg leading-snug line-clamp-2 hover:text-primary transition-colors">
            {title}
          </h2>
        </Link>

        {excerpt && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {excerpt}
          </p>
        )}

        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          {publishedAt && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(publishedAt, locale)}
            </span>
          )}
          {readingTime && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {readingTimeLabel(readingTime, locale)}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
