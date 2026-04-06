import Link from 'next/link'
import { cn } from '@/lib/utils'

interface CategoryBadgeProps {
  name: string
  slug: string
  locale?: string
  className?: string
  asLink?: boolean
}

export function CategoryBadge({ name, slug, locale = 'vi', className, asLink = true }: CategoryBadgeProps) {
  const classes = cn(
    'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
    'bg-primary/10 text-primary hover:bg-primary/20 transition-colors',
    className
  )

  if (asLink) {
    return (
      <Link href={`/${locale}/blog?category=${slug}`} className={classes}>
        {name}
      </Link>
    )
  }

  return <span className={classes}>{name}</span>
}
