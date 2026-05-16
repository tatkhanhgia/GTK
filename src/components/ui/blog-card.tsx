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
            <div className="absolute inset-0 gradient-brand opacity-60" />
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
