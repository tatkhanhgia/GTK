import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { getAuthorProfile } from '@/lib/author/get-author-profile'
import { getPosts } from '@/lib/blog/get-posts'
import { getProducts } from '@/lib/products/get-products'
import { BlogCard } from '@/components/ui/blog-card'
import { ProductCard } from '@/components/ui/product-card'
import { NewsletterSection } from '@/components/ui/newsletter-section'
import { PhilosophySection } from '@/components/ui/philosophy-section'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { TopicMarquee } from '@/components/ui/topic-marquee'
import { AchievementsSection } from '@/components/sections/achievements-section'
import { getBlogStats } from '@/lib/author/get-blog-stats'
import type { Locale } from '@/i18n/config'

interface Props {
  params: Promise<{ locale: string }>
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

export const revalidate = 60

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  const loc = locale as Locale
  // Pin locale explicitly to avoid next-intl context drift on RSC re-renders
  const t = await getTranslations({ locale: loc, namespace: 'home' })

  const [authorProfile, postsResult, productsResult, blogStats] =
    await Promise.all([
      getAuthorProfile(loc),
      getPosts({ locale: loc, limit: 3 }),
      getProducts({ locale: loc, limit: 3 }),
      getBlogStats(loc),
    ])
  const heroTagline = getLocalizedText(authorProfile?.philosophy?.heroTagline, loc)
  const story = authorProfile?.philosophy?.story as { root: { children: unknown[] } } | undefined


  const principlesRaw = Array.isArray(authorProfile?.philosophy?.workingPrinciples)
    ? authorProfile.philosophy.workingPrinciples
    : []
  const principles = principlesRaw
    .map((item: unknown) => {
      if (!item || typeof item !== 'object') return null
      const principle = item as Record<string, unknown>
      const title = getLocalizedText(principle.title, loc)
      const description = getLocalizedText(principle.description, loc)
      if (!title || !description) return null
      return {
        title,
        description,
        icon: principle.icon as 'lightbulb' | 'heart' | 'target' | 'rocket' | undefined,
      }
    })
    .filter((item: unknown): item is { title: string; description: string; icon?: 'lightbulb' | 'heart' | 'target' | 'rocket' } => Boolean(item))

  return (
    <main className="flex flex-col">
      {/* Hero Section */}
      <ScrollReveal
        as="section"
        preset="section"
        className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-20 text-center"
      >
        <h1 className="mb-6 font-heading text-4xl font-bold md:text-5xl">
          {t('hero.title')}{' '}
          <span className="gradient-text-brand">{t('hero.titleHighlight')}</span>
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          {heroTagline || t('hero.subtitle')}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/blog"
            className="motion-surface inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 font-medium text-primary-foreground hover:-translate-y-0.5 hover:opacity-90"
          >
            {t('hero.ctaBlog')}
          </Link>
          <Link
            href="/products"
            className="motion-surface inline-flex h-11 items-center justify-center rounded-lg border border-border bg-secondary px-6 font-medium text-secondary-foreground hover:-translate-y-0.5 hover:bg-secondary/80"
          >
            {t('hero.ctaProducts')}
          </Link>
        </div>
      </ScrollReveal>

      {/* Achievements Section — real blog/store counts, not career stats */}
      <div className="border-t border-border bg-secondary/10">
        <AchievementsSection
          achievements={blogStats}
          eyebrow={t('achievements.eyebrow')}
          title={t('achievements.title')}
          subtitle={t('achievements.subtitle')}
        />
      </div>

      <TopicMarquee
        eyebrow={loc === 'vi' ? 'Dang tap trung' : 'Now exploring'}
        items={[
          ...blogStats.map((item) => item.label),
          loc === 'vi' ? 'AI thuc chien' : 'Practical AI',
          loc === 'vi' ? 'Next.js va Payload' : 'Next.js and Payload',
          loc === 'vi' ? 'San pham so' : 'Digital products',
        ]}
      />

      {/* Featured Posts */}
      {postsResult.docs.length > 0 && (
        <section className="border-t border-border px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <ScrollReveal preset="heading">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="font-heading text-2xl font-bold">{t('featuredPosts')}</h2>
                <Link href={`/${loc}/blog`} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  {loc === 'vi' ? 'Xem tất cả →' : 'View all →'}
                </Link>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {postsResult.docs.map((post, index) => {
                  const featuredImage =
                    post.featuredImage && typeof post.featuredImage === 'object'
                      ? { url: (post.featuredImage as { url?: string }).url ?? '', alt: (post.featuredImage as { alt?: string }).alt ?? post.slug }
                      : null
                  const cat =
                    post.category && typeof post.category === 'object'
                      ? { name: getLocalizedText((post.category as { name?: unknown }).name, loc) || '', slug: (post.category as { slug: string }).slug }
                      : null
                  return (
                    <ScrollReveal
                      key={post.id}
                      preset="card"
                      delay={Math.min(index * 0.045, 0.18)}
                    >
                      <BlogCard
                      title={getLocalizedText(post.title, loc) || post.slug}
                      slug={post.slug}
                      excerpt={getLocalizedText(post.excerpt, loc)}
                      featuredImage={featuredImage}
                      category={cat}
                      publishedAt={post.publishedAt ?? undefined}
                      readingTime={post.readingTime ?? undefined}
                      locale={loc}
                      />
                    </ScrollReveal>
                  )
                })}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {productsResult.docs.length > 0 && (
        <section className="border-t border-border bg-secondary/20 px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <ScrollReveal preset="heading">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="font-heading text-2xl font-bold">{t('featuredProducts')}</h2>
                <Link href={`/${loc}/products`} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  {loc === 'vi' ? 'Xem tất cả →' : 'View all →'}
                </Link>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {productsResult.docs.map((product, index) => {
                  const firstImgBlock = Array.isArray(product.images) && product.images[0]
                    ? (product.images[0] as { image: unknown }).image
                    : null
                  const image = firstImgBlock && typeof firstImgBlock === 'object'
                    ? { url: (firstImgBlock as { url?: string }).url ?? '', alt: product.slug }
                    : null
                  return (
                    <ScrollReveal
                      key={product.id}
                      preset="card"
                      delay={Math.min(index * 0.045, 0.18)}
                    >
                      <ProductCard
                      name={typeof product.name === 'string' ? product.name : String(product.name)}
                      slug={product.slug}
                      excerpt={typeof product.excerpt === 'string' ? product.excerpt : undefined}
                      image={image}
                      priceUSD={product.priceUSD}
                      priceVND={product.priceVND}
                      type={product.type}
                      locale={loc}
                      />
                    </ScrollReveal>
                  )
                })}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <ScrollReveal preset="section">
        <section className="border-t border-border px-6 py-16">
          <div className="mx-auto max-w-2xl">
            <NewsletterSection locale={loc} />
          </div>
        </section>
      </ScrollReveal>

      {/* Personal Story & Philosophy */}
      {(story || principles.length > 0) && (
        <ScrollReveal preset="section">
          <section className="border-t border-border bg-secondary/30 px-6 py-16">
            <div className="mx-auto max-w-4xl">
              <div className="mb-8 text-center">
                <h2 className="font-heading text-3xl font-bold tracking-tight">
                  {loc === 'vi' ? 'Triết lý làm việc' : 'How I Work'}
                </h2>
              </div>
              <PhilosophySection story={story} principles={principles} locale={loc} />
            </div>
          </section>
        </ScrollReveal>
      )}
    </main>
  )
}
