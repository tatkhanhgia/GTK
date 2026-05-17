import Link from 'next/link'
import { BlogCard } from '@/components/ui/blog-card'
import { ProductCard } from '@/components/ui/product-card'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import type { Locale } from '@/i18n/config'
import type { getPosts } from '@/lib/blog/get-posts'
import type { getProducts } from '@/lib/products/get-products'

type FeaturedPost = Awaited<ReturnType<typeof getPosts>>['docs'][number]
type FeaturedProduct = Awaited<ReturnType<typeof getProducts>>['docs'][number]

interface HomepageFeaturedContentProps {
  locale: Locale
  posts: FeaturedPost[]
  products: FeaturedProduct[]
  postsTitle: string
  productsTitle: string
}

function getLocalizedText(value: unknown, locale: Locale): string | undefined {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    const localized = record[locale]
    if (typeof localized === 'string') return localized
    const first = Object.values(record).find((item) => typeof item === 'string')
    if (typeof first === 'string') return first
  }
  return undefined
}

function viewAllLabel(locale: Locale) {
  return locale === 'vi' ? 'Xem tất cả ->' : 'View all ->'
}

function getPostCardProps(post: FeaturedPost, locale: Locale) {
  const featuredImage =
    post.featuredImage && typeof post.featuredImage === 'object'
      ? {
          url: (post.featuredImage as { url?: string }).url ?? '',
          alt: (post.featuredImage as { alt?: string }).alt ?? post.slug,
        }
      : null
  const category =
    post.category && typeof post.category === 'object'
      ? {
          name: getLocalizedText((post.category as { name?: unknown }).name, locale) || '',
          slug: (post.category as { slug: string }).slug,
        }
      : null

  return {
    title: getLocalizedText(post.title, locale) || post.slug,
    slug: post.slug,
    excerpt: getLocalizedText(post.excerpt, locale),
    featuredImage,
    category,
    publishedAt: post.publishedAt ?? undefined,
    readingTime: post.readingTime ?? undefined,
    locale,
  }
}

function getProductCardProps(product: FeaturedProduct, locale: Locale) {
  const firstImageBlock = Array.isArray(product.images) && product.images[0]
    ? (product.images[0] as { image: unknown }).image
    : null
  const image = firstImageBlock && typeof firstImageBlock === 'object'
    ? { url: (firstImageBlock as { url?: string }).url ?? '', alt: product.slug }
    : null

  return {
    name: typeof product.name === 'string' ? product.name : String(product.name),
    slug: product.slug,
    excerpt: typeof product.excerpt === 'string' ? product.excerpt : undefined,
    image,
    priceUSD: product.priceUSD,
    priceVND: product.priceVND,
    type: product.type,
    locale,
  }
}

export function HomepageFeaturedContent({
  locale,
  posts,
  products,
  postsTitle,
  productsTitle,
}: HomepageFeaturedContentProps) {
  const hasPosts = posts.length > 0
  const hasProducts = products.length > 0
  if (!hasPosts && !hasProducts) return null

  const [leadPost, ...supportingPosts] = posts

  return (
    <div className="border-t border-border">
      {hasPosts && (
        <section className="px-6 py-16 md:py-20">
          <div className="mx-auto max-w-6xl">
            <ScrollReveal preset="heading">
              <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="mb-2 text-sm font-medium text-primary">
                    {locale === 'vi' ? 'Cách tôi suy nghĩ' : 'How I think'}
                  </p>
                  <h2 className="font-heading text-3xl font-bold tracking-tight">{postsTitle}</h2>
                </div>
                <Link
                  href={`/${locale}/blog`}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {viewAllLabel(locale)}
                </Link>
              </div>
            </ScrollReveal>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.8fr)]">
              {leadPost && (
                <ScrollReveal preset="card">
                  <div className="lg:[&_.aspect-video]:aspect-[16/9]">
                    <BlogCard {...getPostCardProps(leadPost, locale)} />
                  </div>
                </ScrollReveal>
              )}
              {supportingPosts.length > 0 && (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
                  {supportingPosts.map((post, index) => (
                    <ScrollReveal
                      key={post.id}
                      preset="card"
                      delay={Math.min((index + 1) * 0.045, 0.18)}
                    >
                      <div className="lg:[&_.aspect-video]:hidden">
                        <BlogCard {...getPostCardProps(post, locale)} />
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {hasProducts && (
        <section className="border-t border-border bg-secondary/20 px-6 py-16 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
            <ScrollReveal preset="heading">
              <div className="lg:sticky lg:top-24">
                <p className="mb-2 text-sm font-medium text-primary">
                  {locale === 'vi' ? 'Tạo ra khi đang xây' : 'Made while building'}
                </p>
                <h2 className="font-heading text-3xl font-bold tracking-tight">{productsTitle}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {locale === 'vi'
                    ? 'Tài nguyên, template và source code được tạo ra từ quá trình thử nghiệm thật.'
                    : 'Resources, templates, and source code shaped by real experiments.'}
                </p>
                <Link
                  href={`/${locale}/products`}
                  className="mt-5 inline-flex text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {viewAllLabel(locale)}
                </Link>
              </div>
            </ScrollReveal>
            <div className="flex gap-5 overflow-x-auto pb-2 [scrollbar-width:thin] lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0">
              {products.map((product, index) => (
                <ScrollReveal
                  key={product.id}
                  preset="card"
                  delay={Math.min(index * 0.045, 0.18)}
                  className="min-w-[18rem] lg:min-w-0"
                >
                  <ProductCard {...getProductCardProps(product, locale)} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
