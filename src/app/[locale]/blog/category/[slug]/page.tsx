import { getPosts } from '@/lib/blog/get-posts'
import { getBlogCategories } from '@/lib/blog/get-categories'
import { BlogCard } from '@/components/ui/blog-card'
import { Sidebar, SidebarSection } from '@/components/layout/sidebar'
import type { Locale } from '@/i18n/config'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export const revalidate = 60

export default async function CategoryPage({ params }: Props) {
  const { locale, slug } = await params
  const loc = locale as Locale

  const [postsResult, categories] = await Promise.all([
    getPosts({ locale: loc, category: slug }),
    getBlogCategories(loc),
  ])

  const currentCategory = categories.find((c) => c.slug === slug)
  const categoryName = currentCategory
    ? typeof currentCategory.name === 'string'
      ? currentCategory.name
      : (currentCategory.name as Record<string, string>)[loc] ??
        String(currentCategory.name)
    : slug

  const isVi = loc === 'vi'

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10">
      <h1 className="font-heading font-bold text-3xl mb-2">{categoryName}</h1>
      <p className="text-muted-foreground mb-8">
        {isVi
          ? `${postsResult.totalDocs} bài viết`
          : `${postsResult.totalDocs} posts`}
      </p>

      <div className="flex gap-8 items-start">
        <div className="flex-1 min-w-0">
          {postsResult.docs.length === 0 ? (
            <p className="text-muted-foreground">
              {isVi ? 'Chưa có bài viết nào.' : 'No posts yet.'}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {postsResult.docs.map((post) => {
                const img =
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
                        name: String(
                          (post.category as { name: unknown }).name
                        ),
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
                    featuredImage={img}
                    category={cat}
                    publishedAt={post.publishedAt ?? undefined}
                    readingTime={post.readingTime ?? undefined}
                    locale={loc}
                  />
                )
              })}
            </div>
          )}
        </div>

        <Sidebar className="hidden lg:block">
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
                      href={`/${loc}/blog/category/${cat.slug}`}
                      className={`text-sm hover:text-primary transition-colors ${
                        cat.slug === slug
                          ? 'text-primary font-medium'
                          : 'text-muted-foreground'
                      }`}
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
