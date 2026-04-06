import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AuthorMiniCardProps {
  name: string
  title?: string
  avatarUrl?: string | null
  locale: string
  variant?: 'compact' | 'full'
}

export function AuthorMiniCard({
  name,
  title,
  avatarUrl,
  locale,
  variant = 'compact',
}: AuthorMiniCardProps) {
  const isVi = locale === 'vi'
  const isFull = variant === 'full'
  const fallbackLabel = name.trim().charAt(0).toUpperCase() || 'G'

  return (
    <section
      className={cn(
        'rounded-3xl border border-border/60 bg-secondary/50',
        isFull ? 'p-8 md:p-10' : 'p-6 md:p-8'
      )}
    >
      <div
        className={cn(
          'flex gap-4 md:gap-6',
          isFull ? 'flex-col md:flex-row md:items-center' : 'flex-col sm:flex-row sm:items-center'
        )}
      >
        <div
          className={cn(
            'relative shrink-0 overflow-hidden rounded-full border border-border/60 bg-card',
            isFull ? 'h-20 w-20 md:h-24 md:w-24' : 'h-14 w-14 md:h-16 md:w-16'
          )}
        >
          {avatarUrl ? (
            <Image src={avatarUrl} alt={name} fill className="object-cover" sizes="96px" />
          ) : (
            <div className="gradient-brand flex h-full w-full items-center justify-center text-lg font-heading font-bold text-white">
              {fallbackLabel}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-primary">
            {isVi ? 'Người đứng sau GTKBlog' : 'Behind GTKBlog'}
          </p>
          <h3 className={cn('mt-1 font-heading font-semibold', isFull ? 'text-2xl' : 'text-xl')}>
            {name}
          </h3>
          {title && <p className="mt-1 text-sm text-muted-foreground md:text-base">{title}</p>}
          {isFull && (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              {isVi
                ? 'Mình chia sẻ về lập trình, AI, hệ thống số và những bài học thực tế từ quá trình xây dựng sản phẩm.'
                : 'I write about programming, AI, digital systems, and practical lessons from building products.'}
            </p>
          )}
        </div>

        <div className="flex items-center">
          <Link
            href={`/${locale}/me`}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {isVi ? (isFull ? 'Tìm hiểu thêm' : 'Về tác giả') : isFull ? 'Learn more' : 'About the author'}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
