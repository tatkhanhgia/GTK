import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { getAuthorProfile } from '@/lib/author/get-author-profile'
import { PhilosophySection } from '@/components/ui/philosophy-section'
import { LazySection } from '@/components/ui/lazy-section'
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

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  const loc = locale as Locale
  const t = await getTranslations('home')

  const authorProfile = await getAuthorProfile(loc)
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
      <section className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="mb-6 font-heading text-4xl font-bold md:text-5xl">
          {t('hero.title')}{' '}
          <span className="gradient-text-brand">{t('hero.titleHighlight')}</span>
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          {heroTagline || t('hero.subtitle')}
        </p>
        <div className="mt-10 flex gap-4">
          <Link
            href="/blog"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {t('hero.ctaBlog')}
          </Link>
          <Link
            href="/products"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-secondary px-6 font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            {t('hero.ctaProducts')}
          </Link>
        </div>
      </section>

      {/* Personal Story & Philosophy — Lazy loaded */}
      {(story || principles.length > 0) && (
        <LazySection>
          <section className="border-t border-border bg-secondary/30 px-6 py-16">
            <div className="mx-auto max-w-4xl">
              <div className="mb-8 text-center">
                <h2 className="font-heading text-3xl font-bold tracking-tight"
                >
                  {loc === 'vi' ? 'Triết lý làm việc' : 'How I Work'}
                </h2>
              </div>
              <PhilosophySection story={story} principles={principles} locale={loc} />
            </div>
          </section>
        </LazySection>
      )}
    </main>
  )
}
