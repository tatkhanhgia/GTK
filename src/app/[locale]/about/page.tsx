import { getPayload } from 'payload'
import config from '@payload-config'
import { RichTextRenderer } from '@/components/blog/rich-text-renderer'
import type { Locale } from '@/i18n/config'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ locale: string }>
}

// Revalidate once per hour — about page changes infrequently
export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const isVi = locale === 'vi'
  return {
    title: isVi ? 'Về mình' : 'About',
    description: isVi ? 'Tìm hiểu về GTKBlog' : 'Learn about GTKBlog',
  }
}

/**
 * About page — fetches content from the Payload CMS "pages" collection
 * (slug: "about"). Falls back to static copy when CMS is unavailable.
 * Includes Person JSON-LD schema for SEO.
 */
export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  const loc = locale as Locale
  const isVi = loc === 'vi'

  // Attempt to load CMS content; silently fall back if DB is unreachable
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let aboutContent: any = null
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'pages',
      locale: loc,
      where: { slug: { equals: 'about' } },
      limit: 1,
    })
    aboutContent = result.docs[0] ?? null
  } catch {
    // DB not connected in dev — static fallback renders below
  }

  return (
    <div className="mx-auto max-w-[800px] px-6 py-16">
      {/* Person structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: 'GTKBlog Author',
            url: process.env.NEXT_PUBLIC_APP_URL,
            sameAs: [],
          }),
        }}
      />

      <h1 className="font-heading font-bold text-4xl mb-6">
        {isVi ? 'Về mình' : 'About'}
      </h1>

      {aboutContent ? (
        <div className="prose-custom">
          <RichTextRenderer content={aboutContent.content} />
        </div>
      ) : (
        // Static fallback when no CMS content is available
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p>
            {isVi
              ? 'Xin chào! Tôi là tác giả của GTKBlog, một blog cá nhân về công nghệ và AI.'
              : "Hello! I'm the author of GTKBlog, a personal blog about technology and AI."}
          </p>
          <p>
            {isVi
              ? 'Blog này chia sẻ kiến thức về lập trình, AI, và các sản phẩm số.'
              : 'This blog shares knowledge about programming, AI, and digital products.'}
          </p>
        </div>
      )}
    </div>
  )
}
