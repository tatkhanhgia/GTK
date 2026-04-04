import { useTranslations } from 'next-intl'
import Link from 'next/link'

// Homepage placeholder — Phase 6 will replace with full hero + featured content
export default function HomePage() {
  const t = useTranslations('home')

  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 py-20">
      <h1 className="font-heading font-bold text-4xl md:text-5xl mb-6">
        {t('hero.title')}{' '}
        <span className="gradient-text-brand">{t('hero.titleHighlight')}</span>
      </h1>
      <p className="text-muted-foreground text-lg max-w-xl mb-10">
        {t('hero.subtitle')}
      </p>
      <div className="flex gap-4">
        <Link
          href="/blog"
          className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
        >
          {t('hero.ctaBlog')}
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center justify-center h-11 px-6 rounded-lg border border-border bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors"
        >
          {t('hero.ctaProducts')}
        </Link>
      </div>
    </main>
  )
}
