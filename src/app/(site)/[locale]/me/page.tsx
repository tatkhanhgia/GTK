import type { Metadata } from 'next'
import type { Locale } from '@/i18n/config'
import { getAuthorProfile } from '@/lib/author/get-author-profile'
import { getPosts } from '@/lib/blog/get-posts'
import { BioSection } from '@/components/me/bio-section'
import { SkillsGrid } from '@/components/me/skills-grid'
import { TimelineSection } from '@/components/me/timeline-section'
import { ContactForm } from '@/components/me/contact-form'
import { QuickStats } from '@/components/me/quick-stats'
import { BlogCard } from '@/components/ui/blog-card'
import { RichTextRenderer } from '@/components/blog/rich-text-renderer'
import { PhilosophySection } from '@/components/ui/philosophy-section'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

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

const meTranslations = {
  vi: {
    about: 'Về tác giả',
    contentSoon: 'Nội dung đang được cập nhật.',
    buildingNow: 'Hiện tại mình đang',
    principles: 'Những điều mình tin',
    principlesSubtitle: 'Nguyên tắc hướng dẫn cách mình sống và làm việc',
    selectedWriting: 'Bài viết',
    selectedWritingFallback: 'Một vài bài gần đây mình nghĩ bạn sẽ thích',
    contact: 'Gửi lời chào',
    contactName: 'Tên của bạn',
    contactEmail: 'Email',
    contactMessage: 'Bạn muốn trao đổi gì?',
    contactSend: 'Gửi lời chào',
    contactSending: 'Đang gửi...',
    contactSuccess: 'Mình đã nhận được tin nhắn. Cảm ơn bạn.',
    contactError: 'Gửi thất bại. Vui lòng thử lại.',
    contactRateLimit: 'Bạn đã gửi quá nhiều tin nhắn. Vui lòng thử lại sau.',
    defaultHeroSentence: 'Mình viết về công nghệ, AI và cách biến ý tưởng thành sản phẩm số hữu ích.',
  },
  en: {
    about: 'About Me',
    contentSoon: 'Content coming soon.',
    buildingNow: "What I'm up to these days",
    principles: 'What I believe',
    principlesSubtitle: 'Principles that guide how I live and work',
    selectedWriting: 'Writing',
    selectedWritingFallback: 'A few recent notes you might enjoy',
    contact: 'Say hello',
    contactName: 'Your name',
    contactEmail: 'Email',
    contactMessage: 'What would you like to talk about?',
    contactSend: 'Say hello',
    contactSending: 'Sending...',
    contactSuccess: 'Got your message. Thank you.',
    contactError: 'Failed to send. Please try again.',
    contactRateLimit: 'Too many messages. Please try again later.',
    defaultHeroSentence: 'I write about technology, AI, and how to turn ideas into practical digital products.',
  },
}

interface MePostCard {
  slug: string
  title: string
  excerpt?: string
  featuredImage: {
    url: string
    alt: string
  } | null
  category: {
    name: string
    slug: string
  } | null
  publishedAt?: string
  readingTime?: number
}

interface MeWritingCard extends MePostCard {
  note: string | undefined
}

function mapPostForCard(post: unknown, locale: Locale): MePostCard | null {
  if (!post || typeof post !== 'object') return null
  const p = post as Record<string, unknown>
  const slug = typeof p.slug === 'string' ? p.slug : null
  if (!slug) return null

  const featuredImageObj = p.featuredImage
  const featuredImage =
    featuredImageObj && typeof featuredImageObj === 'object'
      ? {
          url: ((featuredImageObj as { url?: string }).url ?? ''),
          alt: ((featuredImageObj as { alt?: string }).alt ?? slug),
        }
      : null

  const categoryObj = p.category
  const category =
    categoryObj && typeof categoryObj === 'object'
      ? {
          name: getLocalizedText((categoryObj as { name?: unknown }).name, locale) || '',
          slug: (categoryObj as { slug?: string }).slug || '',
        }
      : null

  return {
    slug,
    title: getLocalizedText(p.title, locale) || slug,
    excerpt: getLocalizedText(p.excerpt, locale),
    featuredImage,
    category: category && category.slug ? category : null,
    publishedAt: typeof p.publishedAt === 'string' ? p.publishedAt : undefined,
    readingTime: typeof p.readingTime === 'number' ? p.readingTime : undefined,
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const loc = locale as Locale
  const profile = await getAuthorProfile(loc)

  return {
    title: getLocalizedText(profile?.meta?.metaTitle, loc) || (loc === 'vi' ? 'Về tác giả' : 'About Me'),
    description: getLocalizedText(profile?.meta?.metaDescription, loc) || '',
  }
}

export default async function MePage({ params }: Props) {
  const { locale } = await params
  const loc = locale as Locale
  const t = meTranslations[loc] || meTranslations.en

  const [profile, latestPostsResult] = await Promise.all([
    getAuthorProfile(loc),
    getPosts({ locale: loc, page: 1, limit: 3 }).catch(() => ({ docs: [] })),
  ])

  if (!profile) {
    return (
      <div className="mx-auto max-w-[800px] px-6 py-16 text-muted-foreground">
        <h1 className="mb-4 font-heading text-4xl font-bold">{t.about}</h1>
        <p>{t.contentSoon}</p>
      </div>
    )
  }

  const editorial = profile.meEditorial && typeof profile.meEditorial === 'object'
    ? (profile.meEditorial as Record<string, unknown>)
    : null

  const heroSentence = getLocalizedText(editorial?.heroSentence, loc) || t.defaultHeroSentence
  const buildingNow = editorial?.buildingNow
  const timelineContext = getLocalizedText(editorial?.timelineContext, loc)
  const contactCtaText = getLocalizedText(editorial?.contactCtaText, loc)

  const principlesRaw = Array.isArray(editorial?.principles) ? editorial.principles : []
  const principles = principlesRaw
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const principle = item as Record<string, unknown>
      const title = getLocalizedText(principle.title, loc)
      const description = getLocalizedText(principle.description, loc)
      if (!title || !description) return null
      return { title, description }
    })
    .filter((item): item is { title: string; description: string } => Boolean(item))

  // New philosophy fields from CMS
  const philosophyStory = profile?.philosophy?.story as { root: { children: unknown[] } } | undefined
  const philosophyPrinciplesRaw = Array.isArray(profile?.philosophy?.workingPrinciples)
    ? profile.philosophy.workingPrinciples
    : []
  const philosophyPrinciples = philosophyPrinciplesRaw
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

  const selectedWritingRaw = Array.isArray(editorial?.selectedWriting) ? editorial.selectedWriting : []
  const curatedWriting = selectedWritingRaw
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null
      const writing = entry as Record<string, unknown>
      const post = mapPostForCard(writing.post, loc)
      if (!post) return null
      const note = getLocalizedText(writing.note, loc)
      return { ...post, note }
    })
    .filter((item): item is MeWritingCard => Boolean(item))

  const fallbackWriting = (latestPostsResult.docs || [])
    .map((post) => mapPostForCard(post, loc))
    .filter((item): item is MePostCard => Boolean(item))
    .map((post) => ({ ...post, note: undefined }))

  const writingToRender: MeWritingCard[] =
    curatedWriting.length > 0 ? curatedWriting : fallbackWriting

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: profile.name || 'GTKBlog Author',
            url: process.env.NEXT_PUBLIC_APP_URL,
            sameAs: profile.socialLinks?.map((l: { url: string }) => l.url) || [],
          }),
        }}
      />

      <div className="space-y-16 md:space-y-20">
        {/* Hero Section */}
        <ScrollReveal as="section" className="gradient-brand-subtle relative overflow-hidden rounded-3xl border border-border/60 px-6 py-12 md:px-10 md:py-14">
          <div className="ambient-warm absolute inset-0" />
          <div className="relative z-10">
            <BioSection
              name={profile.name || 'GTKBlog Author'}
              title={getLocalizedText(profile.title, loc) || 'Software Engineer'}
              heroSentence={heroSentence}
              avatar={profile.avatar}
              bio={profile.bio}
              socialLinks={profile.socialLinks}
            />
          </div>
        </ScrollReveal>

        {/* At a Glance */}
        <ScrollReveal>
          <section>
            <div className="mb-8">
              <h2 className="font-heading text-3xl font-bold tracking-tight">
                {loc === 'vi' ? 'Nhìn nhanh' : 'At a glance'}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {loc === 'vi'
                  ? 'Một chút về con số, nhưng số không nói lên tất cả'
                  : 'Some numbers, but numbers never tell the whole story'}
              </p>
            </div>
            <QuickStats
              yearsOfExperience={profile.yearsOfExperience}
              projectsCompleted={profile.projectsCompleted}
              postsPublished={writingToRender.length}
              locale={loc}
            />
          </section>
        </ScrollReveal>

        {/* Timeline - Moments that matter */}
        {profile.timeline?.length > 0 && (
          <ScrollReveal>
            <section>
              <div className="mb-8">
                <h2 className="font-heading text-3xl font-bold tracking-tight">
                  {loc === 'vi' ? 'Những cột mốc' : 'Moments that matter'}
                </h2>
                <p className="mt-2 text-muted-foreground">
                  {loc === 'vi'
                    ? 'Những quyết định và khoảnh khắc đã định hình mình'
                    : 'Decisions and turning points that shaped who I am'}
                </p>
              </div>
              <TimelineSection timeline={profile.timeline} locale={loc} context={timelineContext} />
            </section>
          </ScrollReveal>
        )}

        {/* Skills - My Stack */}
        {profile.skills?.length > 0 && (
          <ScrollReveal>
            <section>
              <div className="mb-8">
                <h2 className="font-heading text-3xl font-bold tracking-tight">
                  {loc === 'vi' ? 'Công cụ mình dùng' : 'My stack'}
                </h2>
                <p className="mt-2 text-muted-foreground">
                  {loc === 'vi'
                    ? 'Không phải để khoe, mà là để chia sẻ những gì đang giúp mình'
                    : "Not to brag, but to share what's actually helping me"}
                </p>
              </div>
              <SkillsGrid skills={profile.skills} locale={loc} />
            </section>
          </ScrollReveal>
        )}

        {/* Principles - What I Believe */}
        {(principles.length > 0 || philosophyPrinciples.length > 0 || Boolean(philosophyStory)) && (
          <ScrollReveal>
            <section>
              <div className="mb-8">
                <h2 className="font-heading text-3xl font-bold tracking-tight">
                  {loc === 'vi' ? 'Cách tôi làm việc' : 'How I Work'}
                </h2>
                <p className="mt-2 text-muted-foreground">
                  {loc === 'vi'
                    ? 'Nguyên tắc hướng dẫn cách mình sống và làm việc'
                    : 'Principles that guide how I live and work'}
                </p>
              </div>
              {/* Use new philosophy data with icons if available, fall back to old principles */}
              {philosophyPrinciples.length > 0 ? (
                <PhilosophySection
                  story={philosophyStory}
                  principles={philosophyPrinciples}
                  locale={loc}
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {principles.map((principle) => (
                    <article
                      key={principle.title}
                      className="rounded-2xl border-l-4 border-l-primary border-y border-r border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <h3 className="font-heading text-lg font-semibold">{principle.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
                        {principle.description}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </ScrollReveal>
        )}

        {/* Currently Building */}
        {Boolean(buildingNow) && (
          <ScrollReveal>
            <section className="rounded-3xl border border-border/60 bg-card p-6 md:p-8">
              <h2 className="mb-4 font-heading text-2xl font-semibold">{t.buildingNow}</h2>
              <RichTextRenderer content={buildingNow} />
            </section>
          </ScrollReveal>
        )}

        {/* Blog Posts */}
        {writingToRender.length > 0 && (
          <ScrollReveal>
            <section>
              <div className="mb-8">
                <h2 className="font-heading text-3xl font-bold tracking-tight">{t.selectedWriting}</h2>
                {curatedWriting.length === 0 && (
                  <p className="mt-2 text-muted-foreground">{t.selectedWritingFallback}</p>
                )}
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {writingToRender.map((post) => (
                  <div key={post.slug} className="group space-y-2">
                    <div className="transition-transform duration-300 group-hover:-translate-y-1">
                      <BlogCard
                        title={post.title}
                        slug={post.slug}
                        excerpt={post.excerpt}
                        featuredImage={post.featuredImage}
                        category={post.category}
                        publishedAt={post.publishedAt}
                        readingTime={post.readingTime}
                        locale={loc}
                      />
                    </div>
                    {post.note && <p className="px-1 text-sm text-muted-foreground">{post.note}</p>}
                  </div>
                ))}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* Contact Form */}
        <ScrollReveal>
          <ContactForm locale={loc} translations={t} ctaText={contactCtaText} />
        </ScrollReveal>
      </div>
    </div>
  )
}
