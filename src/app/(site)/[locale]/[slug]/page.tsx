import Image from 'next/image'
import { notFound } from 'next/navigation'
import { RichTextRenderer } from '@/components/blog/rich-text-renderer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { getCmsPageBySlug } from '@/lib/pages/get-cms-page-by-slug'
import { buildMetadata } from '@/lib/seo/metadata-helpers'
import type { Locale } from '@/i18n/config'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

type MediaDoc = {
  alt?: string
  height?: number
  url?: string
  width?: number
}

export const revalidate = 3600

function asText(value: unknown) {
  return typeof value === 'string' ? value : String(value ?? '')
}

function getMediaDoc(value: unknown): MediaDoc | null {
  return value && typeof value === 'object' ? (value as MediaDoc) : null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const loc = locale as Locale
  const page = await getCmsPageBySlug(slug, loc)
  if (!page) return { title: 'Page Not Found' }

  const title = asText(page.seoTitle || page.title)
  const description = typeof page.seoDescription === 'string' ? page.seoDescription : undefined
  const heroImage = getMediaDoc(page.heroImage)

  return buildMetadata({
    title,
    description,
    locale: loc,
    path: `/${slug}`,
    imageUrl: heroImage?.url,
    type: 'website',
  })
}

export default async function CmsPage({ params }: Props) {
  const { locale, slug } = await params
  const loc = locale as Locale
  const page = await getCmsPageBySlug(slug, loc)
  if (!page) notFound()

  const title = asText(page.title)
  const description = typeof page.seoDescription === 'string' ? page.seoDescription : undefined
  const heroImage = getMediaDoc(page.heroImage)
  const heroAlt = heroImage?.alt || title

  return (
    <main className="mx-auto max-w-[1100px] px-6 py-10 md:py-14">
      <ScrollReveal preset="pageHero">
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-3xl font-bold leading-tight md:text-5xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </header>
      </ScrollReveal>

      {heroImage?.url ? (
        <ScrollReveal preset="compact" className="mt-10">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-muted">
            <Image
              src={heroImage.url}
              alt={heroAlt}
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1280px) 1100px, 100vw"
            />
          </div>
        </ScrollReveal>
      ) : null}

      {page.content ? (
        <ScrollReveal preset="section" className="mx-auto mt-12 max-w-3xl">
          <RichTextRenderer content={page.content} />
        </ScrollReveal>
      ) : null}
    </main>
  )
}
