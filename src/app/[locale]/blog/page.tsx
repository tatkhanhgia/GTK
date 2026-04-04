import { getPosts } from '@/lib/blog/get-posts'
import { getBlogCategories } from '@/lib/blog/get-categories'
import { BlogCard } from '@/components/ui/blog-card'
import { CategoryBadge } from '@/components/ui/category-badge'
import { Sidebar, SidebarSection } from '@/components/layout/sidebar'
import { SearchInput } from '@/components/ui/search-input'
import type { Locale } from '@/i18n/config'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string; page?: string }>
}

export const revalidate = 60

export default async function BlogPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { category, page: pageParam } = await searchParams
  const loc = locale as Locale
  const page = pageParam ? parseInt(pageParam, 10) : 1

  const [postsResult, categories] = await Promise.all([
    getPosts({ locale: loc, category, page }),
    getBlogCategories(loc),
  ])

  const isVi = loc === 'vi'

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl md:text-4xl mb-2">
          {isVi ? 'Blog' : 'Blog'}
        </h1>
        <p className="text-muted-foreground">
          {isVi
            ? 'Bài viết về AI, công nghệ và lập trình'
            : 'Articles about AI, technology, and programming'}
        </p>
      </div>

      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        <CategoryBadge
          name={isVi ? 'Tất cả' : 'All'}
          slug=""
          locale={loc}
          asLink={false}
          className={!category ? 'bg-primary text-primary-foreground' : ''}
        />
        {categories.map((cat) => {
          const catName =
            typeof cat.name === 'string'
              ? cat.name
              : (cat.name as Record<string, string>)[loc] ?? String(cat.name)
          return (
            <CategoryBadge
              key={cat.id}
              name={catName}
              slug={cat.slug}
              locale={loc}
              className={
                category === cat.slug ? 'bg-primary text-primary-foreground' : ''
              }
            />
          )
        })}
      </div>

      <div className="flex gap-8 items-start">
        {/* Posts grid */}
        <div className="flex-1 min-w-0">
          {postsResult.docs.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              {isVi ? 'Chưa có bài viết nào.' : 'No posts yet.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {postsResult.docs.map((post) => {
                const featuredImage =
                  post.featuredImage && typeof post.featuredImage === 'object'
                    ? {
                        url:
                          (post.featuredImage as { url?: string }).url ?? '',
                        alt:
                          (post.featuredImage as { alt?: string }).alt ??
                          post.slug,
                      }
                    : null
                const cat =
                  post.category && typeof post.category === 'object'
                    ? {
                        name:
                          typeof (post.category as { name: unknown }).name ===
                          'string'
                            ? (post.category as { name: string }).name
                            : loc,
                        slug: (post.category as { slug: string }).slug,
                      }
                    : null
                return (
                  <BlogCard
                    key={post.id}
                    title={
                      typeof post.title === 'string'
                        ? post.title
                        : String(post.title)
                    }
                    slug={post.slug}
                    excerpt={
                      typeof post.excerpt === 'string'
                        ? post.excerpt
                        : undefined
                    }
                    featuredImage={featuredImage}
                    category={cat}
                    publishedAt={post.publishedAt ?? undefined}
                    readingTime={post.readingTime ?? undefined}
                    locale={loc}
                  />
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {postsResult.totalPages > 1 && (
            <div className="mt-10 flex justify-center gap-2">
              {Array.from(
                { length: postsResult.totalPages },
                (_, i) => i + 1
              ).map((p) => (
                <a
                  key={p}
                  href={`/${loc}/blog?page=${p}${category ? `&category=${category}` : ''}`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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

        {/* Sidebar */}
        <Sidebar className="hidden lg:block">
          <SidebarSection title={isVi ? 'Tìm kiếm' : 'Search'}>
            <SearchInput
              placeholder={isVi ? 'Tìm bài viết...' : 'Search posts...'}
            />
          </SidebarSection>
          <SidebarSection title={isVi ? 'Danh mục' : 'Categories'}>
            <ul className="space-y-2">
              {categories.map((cat) => {
                const catName =
                  typeof cat.name === 'string'
                    ? cat.name
                    : (cat.name as Record<string, string>)[loc] ??
                      String(cat.name)
                return (
                  <li key={cat.id}>
                    <a
                      href={`/${loc}/blog?category=${cat.slug}`}
                      className="flex items-center text-sm hover:text-primary transition-colors py-1"
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
    </div>
  )
}
