import { Skeleton } from './skeleton'
import { SkeletonBlogCard, SkeletonProductCard } from './skeleton-card'

/** Shared a11y props applied to every skeleton root */
const S = { role: 'status' as const, 'aria-busy': true, 'aria-label': 'Loading content' }

/** Blog list — hero + category chips + card grid + sidebar */
export function BlogListPageSkeleton() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10" {...S}>
      <Skeleton className="aspect-video w-full rounded-xl mb-6" />
      <div className="mb-8">
        <Skeleton className="h-9 w-20 mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="mb-8 flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-20 rounded-full" />
        ))}
      </div>
      <div className="flex items-start gap-8">
        <div className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonBlogCard key={i} />)}
        </div>
        <div className="hidden w-[280px] shrink-0 space-y-4 lg:block">
          <Skeleton className="h-9 w-full rounded-lg" />
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
        </div>
      </div>
    </div>
  )
}

/** Blog detail — title + meta + cover + paragraphs + TOC sidebar */
export function BlogDetailSkeleton() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10" {...S}>
      <div className="flex items-start gap-10">
        <article className="min-w-0 flex-1 space-y-4">
          <Skeleton className="h-10 w-4/5" />
          <Skeleton className="h-5 w-full" />
          <div className="flex gap-4 border-b border-border pb-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="aspect-video w-full rounded-xl" />
          <div className="space-y-3">
            {['w-full', 'w-full', 'w-5/6', 'w-full', 'w-full', 'w-4/5', 'w-full', 'w-full', 'w-2/3'].map((cls, i) => (
              <Skeleton key={i} className={`h-4 ${cls}`} />
            ))}
          </div>
        </article>
        <div className="hidden w-[280px] shrink-0 space-y-3 xl:block">
          {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
        </div>
      </div>
    </div>
  )
}

/** Product list — header + filter pills + card grid + sidebar */
export function ProductListPageSkeleton() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10" {...S}>
      <div className="mb-8">
        <Skeleton className="h-9 w-40 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="mb-8 flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <div className="flex items-start gap-8">
        <div className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonProductCard key={i} />)}
        </div>
        <div className="hidden w-[200px] shrink-0 space-y-3 lg:block">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
        </div>
      </div>
    </div>
  )
}

/** Product detail — image gallery + info + CTA */
export function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10" {...S}>
      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
        <Skeleton className="aspect-video w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="space-y-2 pt-2">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
          </div>
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-11 w-32 rounded-lg" />
            <Skeleton className="h-11 w-36 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Profile overview — rendered inside profile layout which supplies the
 * max-w container; this skeleton fills the flex-1 content area only.
 */
export function ProfilePageSkeleton() {
  return (
    <div className="space-y-8" {...S}>
      <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-6">
        <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-52" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}

/** Orders — inside profile layout content area */
export function OrdersTableSkeleton() {
  return (
    <div className="space-y-4" {...S}>
      <Skeleton className="h-7 w-48 mb-6" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  )
}

/** Downloads — inside profile layout content area */
export function DownloadsListSkeleton() {
  return (
    <div className="space-y-4" {...S}>
      <Skeleton className="h-7 w-52 mb-6" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-card p-5">
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-36" />
          </div>
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      ))}
    </div>
  )
}

/** Me/About page — hero section + content blocks */
export function MePageSkeleton() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10 md:py-16" {...S}>
      <div className="space-y-16">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-40" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonBlogCard key={i} />)}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}

/** Homepage — hero + featured posts + products + newsletter */
export function HomePageSkeleton() {
  return (
    <div className="flex flex-col" {...S}>
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-20 space-y-6">
        <Skeleton className="h-12 w-3/4 max-w-2xl" />
        <Skeleton className="h-6 w-xl max-w-xl" />
        <div className="flex gap-4">
          <Skeleton className="h-11 w-32 rounded-lg" />
          <Skeleton className="h-11 w-36 rounded-lg" />
        </div>
      </div>
      <div className="border-t border-border px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <Skeleton className="mb-8 h-8 w-48" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonBlogCard key={i} />)}
          </div>
        </div>
      </div>
    </div>
  )
}
