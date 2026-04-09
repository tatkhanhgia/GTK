import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Locale } from '@/i18n/config'
import { getPosts } from '@/lib/blog/get-posts'
import { getAuthorProfile } from '@/lib/author/get-author-profile'
import { BlogCard } from '@/components/ui/blog-card'
import { RichTextRenderer } from '@/components/blog/rich-text-renderer'
import { AuthorMiniCard } from '@/components/ui/author-mini-card'
import { AboutHeroSection } from '@/components/about/about-hero-section'
import { TopicsGrid } from '@/components/about/topics-grid'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { AchievementsSection } from '@/components/sections/achievements-section'
import { getBlogStats } from '@/lib/author/get-blog-stats'

interface Props {
  params: Promise<{ locale: string }>
}

export const revalidate = 3600

function getLocalizedText(value: unknown, locale: Locale) {
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

async function fetchAboutContent(locale: Locale) {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'pages',
      locale,
      where: { slug: { equals: 'about' } },
      limit: 1,
    })
    return result.docs[0] ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const isVi = locale === 'vi'

  return {
    title: isVi ? 'Về GTKBlog' : 'About GTKBlog',
    description: isVi
      ? 'Tìm hiểu về định hướng, chủ đề và người đứng sau GTKBlog.'
      : 'Learn about GTKBlog, its focus areas, and the author behind it.',
  }
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  const loc = locale as Locale
  const isVi = loc === 'vi'

  const [aboutContent, authorProfile, recentPostsResult, blogStats] =
    await Promise.all([
      fetchAboutContent(loc),
      getAuthorProfile(loc),
      getPosts({ locale: loc, page: 1, limit: 3 }).catch(() => ({ docs: [] })),
      getBlogStats(loc),
    ])

  const recentPosts = 'docs' in recentPostsResult ? recentPostsResult : { docs: [] }

  const authorName = authorProfile?.name || 'GTKBlog Author'
  const authorTitle = getLocalizedText(authorProfile?.title, loc)
  const authorAvatar =
    authorProfile?.avatar && typeof authorProfile.avatar === 'object'
      ? ((authorProfile.avatar as { url?: string }).url ?? null)
      : null

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            name: 'GTKBlog',
            url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/${loc}/about`,
            description: isVi
              ? 'Giới thiệu về GTKBlog, các chủ đề chính và tác giả.'
              : 'About GTKBlog, its core topics, and the author.',
          }),
        }}
      />

      <div className="space-y-16">
        <ScrollReveal>
          <AboutHeroSection locale={loc} />
        </ScrollReveal>

        <ScrollReveal>
          <AchievementsSection
            achievements={blogStats}
            eyebrow={isVi ? 'Blog qua những con số' : 'The blog in numbers'}
            title={
              isVi
                ? 'Một vài cột mốc dọc hành trình'
                : 'A few milestones along the way'
            }
            subtitle={
              isVi
                ? 'Mỗi bài viết, mỗi sản phẩm, mỗi người đăng ký — đều là dấu vết của một quá trình ghi lại kiến thức có kỷ luật.'
                : 'Every article, product, and subscriber is a trace of a disciplined habit of writing things down.'
            }
            variant="contained"
          />
        </ScrollReveal>

        <ScrollReveal as="section" className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)] lg:items-start">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
              {isVi ? 'Về blog' : 'About the blog'}
            </p>
            <h2 className="mt-3 font-heading text-2xl font-semibold md:text-3xl">
              {isVi ? 'Sứ mệnh và cách GTKBlog vận hành' : 'The mission and shape of GTKBlog'}
            </h2>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card p-6 md:p-8">
            {aboutContent ? (
              <div className="prose-custom max-w-none">
                <RichTextRenderer content={aboutContent.content} />
              </div>
            ) : (
              <div className="space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                <p>
                  {isVi
                    ? 'GTKBlog là nơi mình ghi lại kiến thức về lập trình, AI, tự động hóa và cách xây dựng sản phẩm số theo hướng thực tế, dễ áp dụng.'
                    : 'GTKBlog is where I document practical knowledge about programming, AI, automation, and building digital products.'}
                </p>
                <p>
                  {isVi
                    ? 'Mục tiêu không phải viết cho thật nhiều, mà viết rõ, có chọn lọc, và đủ sâu để người đọc có thể áp dụng lại vào công việc của mình.'
                    : 'The goal is not to publish more, but to publish clearly, selectively, and with enough depth to be useful in real work.'}
                </p>
              </div>
            )}
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <TopicsGrid locale={loc} />
        </ScrollReveal>

        <ScrollReveal>
          <AuthorMiniCard
            name={authorName}
            title={authorTitle}
            avatarUrl={authorAvatar}
            locale={loc}
            variant="full"
          />
        </ScrollReveal>

        <ScrollReveal as="section">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
                {isVi ? 'Mới nhất' : 'Latest'}
              </p>
              <h2 className="mt-3 font-heading text-2xl font-semibold md:text-3xl">
                {isVi ? 'Bài viết gần đây' : 'Recent posts'}
              </h2>
            </div>
            <Link
              href={`/${loc}/blog`}
              className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              {isVi ? 'Xem tất cả bài viết →' : 'View all posts →'}
            </Link>
          </div>

          {recentPosts.docs.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {recentPosts.docs.map((post) => {
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
                        name: getLocalizedText((post.category as { name?: unknown }).name, loc) || '',
                        slug: (post.category as { slug: string }).slug,
                      }
                    : null

                return (
                  <BlogCard
                    key={post.id}
                    title={getLocalizedText(post.title, loc) || post.slug}
                    slug={post.slug}
                    excerpt={getLocalizedText(post.excerpt, loc)}
                    featuredImage={featuredImage}
                    category={category}
                    publishedAt={post.publishedAt ?? undefined}
                    readingTime={post.readingTime ?? undefined}
                    locale={loc}
                  />
                )
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-12 text-center text-muted-foreground">
              {isVi ? 'Chưa có bài viết nào để hiển thị.' : 'No posts available yet.'}
            </div>
          )}
        </ScrollReveal>
      </div>
    </div>
  )
}
