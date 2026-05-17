import { notFound } from 'next/navigation'
import { getPostBySlug } from '@/lib/blog/get-post-by-slug'
import { getRelatedPosts } from '@/lib/blog/get-related-posts'
import { RichTextRenderer } from '@/components/blog/rich-text-renderer'
import { TableOfContents } from '@/components/blog/table-of-contents'
import { ShareButtons } from '@/components/blog/share-buttons'
import { CommentSection } from '@/components/blog/comment-section'
import { ReadingProgress } from '@/components/ui/reading-progress'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { BlogCard } from '@/components/ui/blog-card'
import { Sidebar } from '@/components/layout/sidebar'
import { formatDate, readingTimeLabel } from '@/lib/utils'
import { Calendar, Clock, User } from 'lucide-react'
import type { Locale } from '@/i18n/config'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const post = await getPostBySlug(slug, locale as Locale)
  if (!post) return { title: 'Post Not Found' }

  const title =
    typeof post.title === 'string' ? post.title : String(post.title)
  const description =
    typeof post.excerpt === 'string' ? post.excerpt : undefined
  const imageUrl =
    post.featuredImage && typeof post.featuredImage === 'object'
      ? (post.featuredImage as { url?: string }).url
      : undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.publishedAt ?? undefined,
      ...(imageUrl ? { images: [{ url: imageUrl }] } : {}),
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params
  const loc = locale as Locale

  const post = await getPostBySlug(slug, loc)
  if (!post) notFound()

  const title =
    typeof post.title === 'string' ? post.title : String(post.title)
  const excerpt =
    typeof post.excerpt === 'string' ? post.excerpt : undefined

  const relatedPosts =
    post.category && typeof post.category === 'object'
      ? await getRelatedPosts(
          slug,
          (post.category as { id: string }).id,
          loc
        )
      : []

  const authorName =
    post.author && typeof post.author === 'object'
      ? (post.author as { name?: string }).name ?? 'Author'
      : 'Author'

  const isVi = loc === 'vi'

  return (
    <>
      <ReadingProgress />
      <div className="mx-auto max-w-[1200px] px-6 py-10">
        <div className="flex gap-10 items-start">
          {/* Main content */}
          <article className="flex-1 min-w-0">
            {/* Header */}
            <ScrollReveal preset="pageHero">
            <header className="mb-8">
              <h1 className="font-heading font-bold text-3xl md:text-4xl leading-tight mb-4">
                {title}
              </h1>
              {excerpt && (
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  {excerpt}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-b border-border pb-6">
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {authorName}
                </span>
                {post.publishedAt && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {formatDate(post.publishedAt, loc)}
                  </span>
                )}
                {post.readingTime && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {readingTimeLabel(Number(post.readingTime), loc)}
                  </span>
                )}
              </div>
            </header>
            </ScrollReveal>

            {/* Rich text content */}
            <ScrollReveal preset="compact" className="prose-custom mb-10">
              <RichTextRenderer content={post.content} />
            </ScrollReveal>

            {/* Share buttons */}
            <ShareButtons title={title} locale={loc} />

            {/* Comments */}
            <div className="mt-12">
              <CommentSection postId={String(post.id)} locale={loc} />
            </div>
          </article>

          {/* Sidebar — TOC */}
          <ScrollReveal preset="compact" className="hidden xl:block">
            <Sidebar>
              <TableOfContents content={post.content} locale={loc} />
            </Sidebar>
          </ScrollReveal>
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <ScrollReveal as="section" preset="section" className="mt-16">
            <h2 className="font-heading font-semibold text-xl mb-6">
              {isVi ? 'Bài viết liên quan' : 'Related Posts'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {relatedPosts.map((related, index) => {
                const img =
                  related.featuredImage &&
                  typeof related.featuredImage === 'object'
                    ? {
                        url:
                          (related.featuredImage as { url?: string }).url ?? '',
                        alt:
                          (related.featuredImage as { alt?: string }).alt ??
                          related.slug,
                      }
                    : null
                const cat =
                  related.category && typeof related.category === 'object'
                    ? {
                        name: String(
                          (related.category as { name: unknown }).name
                        ),
                        slug: (related.category as { slug: string }).slug,
                      }
                    : null
                return (
                  <ScrollReveal
                    key={related.id}
                    preset="card"
                    delay={Math.min(index * 0.04, 0.16)}
                    viewport="card"
                  >
                    <BlogCard
                      title={
                        typeof related.title === 'string'
                          ? related.title
                          : String(related.title)
                      }
                      slug={related.slug}
                      featuredImage={img}
                      category={cat}
                      publishedAt={related.publishedAt ?? undefined}
                      readingTime={related.readingTime != null ? Number(related.readingTime) : undefined}
                      locale={loc}
                    />
                  </ScrollReveal>
                )
              })}
            </div>
          </ScrollReveal>
        )}
      </div>
    </>
  )
}
