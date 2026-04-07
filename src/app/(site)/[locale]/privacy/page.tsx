import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'privacy' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'privacy' })

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-4xl font-bold text-[var(--foreground)]">
          {t('title')}
        </h1>

        <div className="prose prose-lg max-w-none text-[var(--foreground)]">
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">{t('sections.intro.title')}</h2>
            <p className="mb-4 text-[var(--muted-foreground)]">{t('sections.intro.content')}</p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">{t('sections.dataCollection.title')}</h2>
            <p className="mb-4 text-[var(--muted-foreground)]">{t('sections.dataCollection.content')}</p>
            <ul className="mb-4 list-inside list-disc text-[var(--muted-foreground)]">
              <li>{t('sections.dataCollection.items.name')}</li>
              <li>{t('sections.dataCollection.items.email')}</li>
              <li>{t('sections.dataCollection.items.usage')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">{t('sections.cookies.title')}</h2>
            <p className="mb-4 text-[var(--muted-foreground)]">{t('sections.cookies.content')}</p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">{t('sections.thirdParty.title')}</h2>
            <p className="mb-4 text-[var(--muted-foreground)]">{t('sections.thirdParty.content')}</p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">{t('sections.contact.title')}</h2>
            <p className="mb-4 text-[var(--muted-foreground)]">{t('sections.contact.content')}</p>
          </section>
        </div>
      </div>
    </main>
  )
}
