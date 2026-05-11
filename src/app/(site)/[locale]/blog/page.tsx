import type { Locale } from '@/i18n/config'
import { getPosts } from '@/lib/blog/get-posts'
import { getBlogCategories } from '@/lib/blog/get-categories'
import { getAuthorProfile } from '@/lib/author/get-author-profile'
import { BlogCard } from '@/components/ui/blog-card'
import { CategoryBadge } from '@/components/ui/category-badge'
import { AuthorMiniCard } from '@/components/ui/author-mini-card'
import { NewsletterSection } from '@/components/ui/newsletter-section'
import { FeaturedPostHero } from '@/components/blog/featured-post-hero'
import { Sidebar, SidebarSection } from '@/components/layout/sidebar'
import { SearchInput } from '@/components/ui/search-input'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string; page?: string }>
}

export const revalidate = 60

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

export default async function BlogPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { category, page: pageParam } = await searchParams
  const loc = locale as Locale
  const parsedPage = pageParam ? Number.parseInt(pageParam, 10) : 1
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1
  const isVi = loc === 'vi'

  const [postsResult, categories, authorProfile] = await Promise.all([
    getPosts({ locale: loc, category, page }),
    getBlogCategories(loc),
    getAuthorProfile(loc),
  ])

  const showFeatured = page === 1 && !category && postsResult.docs.length > 0
  const featuredPost = showFeatured ? postsResult.docs[0] : null
  const gridPosts = showFeatured ? postsResult.docs.slice(1) : postsResult.docs
  const authorName = authorProfile?.name || 'GTKBlog Author'
  const authorTitle = getLocalizedText(authorProfile?.title, loc)
  const authorAvatar =
    authorProfile?.avatar && typeof authorProfile.avatar === 'object'
      ? ((authorProfile.avatar as { url?: string }).url ?? null)
      : null

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10">
      {featuredPost && (
        <ScrollReveal>
          <FeaturedPostHero
            title={getLocalizedText(featuredPost.title, loc) || featuredPost.slug}
            slug={featuredPost.slug}
            excerpt={getLocalizedText(featuredPost.excerpt, loc)}
            featuredImage={
              featuredPost.featuredImage && typeof featuredPost.featuredImage === 'object'
                ? {
                    url: (featuredPost.featuredImage as { url?: string }).url ?? '',
                    alt: (featuredPost.featuredImage as { alt?: string }).alt ?? featuredPost.slug,
                  }
                : null
            }
            category={
              featuredPost.category && typeof featuredPost.category === 'object'
                ? {
                    name:
                      getLocalizedText((featuredPost.category as { name?: unknown }).name, loc) || '',
                    slug: (featuredPost.category as { slug: string }).slug,
                  }
                : null
            }
            publishedAt={featuredPost.publishedAt ?? undefined}
            readingTime={featuredPost.readingTime ?? undefined}
            locale={loc}
          />
        </ScrollReveal>
      )}

      <ScrollReveal>
        <div className="mb-8">
          <h1 className="mb-2 font-heading text-3xl font-bold md:text-4xl">Blog</h1>
          <p className="text-muted-foreground">
            {isVi
              ? 'Bài viết về AI, công nghệ, lập trình và sản phẩm số.'
              : 'Articles about AI, technology, programming, and digital products.'}
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          <CategoryBadge
            name={isVi ? 'Tất cả' : 'All'}
            slug=""
            locale={loc}
            asLink={false}
            className={!category ? 'bg-primary text-primary-foreground' : ''}
          />
          {categories.map((cat) => {
            const catName = getLocalizedText(cat.name, loc) || String(cat.name)
            return (
              <CategoryBadge
                key={cat.id}
                name={catName}
                slug={cat.slug}
                locale={loc}
                className={category === cat.slug ? 'bg-primary text-primary-foreground' : ''}
              />
            )
          })}
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="flex items-start gap-8">
          <div className="min-w-0 flex-1">
            {postsResult.docs.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground">
                {isVi ? 'Chưa có bài viết nào.' : 'No posts yet.'}
              </div>
            ) : gridPosts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {gridPosts.map((post, index) => {
                  const featuredImage =
                    post.featuredImage && typeof post.featuredImage === 'object'
                      ? {
                          url: (post.featuredImage as { url?: string }).url ?? '',
                          alt: (post.featuredImage as { alt?: string }).alt ?? post.slug,
                        }
                      : null
                  const cat =
                    post.category && typeof post.category === 'object'
                      ? {
                          name: getLocalizedText((post.category as { name?: unknown }).name, loc) || '',
                          slug: (post.category as { slug: string }).slug,
                        }
                      : null

                  return (
                    <ScrollReveal
                      key={post.id}
                      y={14}
                      delay={Math.min(index * 0.035, 0.18)}
                      viewport="card"
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
            ) : null}

            {postsResult.totalPages > 1 && (
              <div className="mt-10 flex justify-center gap-2">
                {Array.from({ length: postsResult.totalPages }, (_, index) => index + 1).map((p) => (
                  <a
                    key={p}
                    href={`/${loc}/blog?page=${p}${category ? `&category=${category}` : ''}`}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {p}
                  </a>
                ))}
              </div>
            )}
          </div>

          <Sidebar className="hidden lg:block">
            <SidebarSection title={isVi ? 'Tìm kiếm' : 'Search'}>
              <SearchInput placeholder={isVi ? 'Tìm bài viết...' : 'Search posts...'} />
            </SidebarSection>
            <SidebarSection title={isVi ? 'Danh mục' : 'Categories'}>
              <ul className="space-y-2">
                {categories.map((cat) => {
                  const catName = getLocalizedText(cat.name, loc) || String(cat.name)
                  return (
                    <li key={cat.id}>
                      <a
                        href={`/${loc}/blog?category=${cat.slug}`}
                        className="flex items-center py-1 text-sm transition-colors hover:text-primary"
                      >
                        {catName}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </SidebarSection>
          </Sidebar>
        </div>
      </ScrollReveal>

      <ScrollReveal className="mt-16">
        <AuthorMiniCard
          name={authorName}
          title={authorTitle}
          avatarUrl={authorAvatar}
          locale={loc}
          variant="compact"
        />
      </ScrollReveal>

      <ScrollReveal className="mt-12">
        <NewsletterSection locale={loc} />
      </ScrollReveal>
    </div>
  )
}
