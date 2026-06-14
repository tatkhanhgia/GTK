import type { MetadataRoute } from 'next'
import { publishedNowWhere } from '@/lib/content/publication-state'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const locales = ['vi', 'en'] as const
const shouldSkipBuildDbAccess = process.env.SKIP_BUILD_DB_ACCESS === 'true'
const reservedCmsPageSlugs = new Set(['about', 'blog', 'logo-showcase', 'me', 'privacy', 'products', 'profile'])

type Locale = (typeof locales)[number]

function buildAlternates(path: string): Record<Locale, string> {
  return Object.fromEntries(locales.map((l) => [l, `${APP_URL}/${l}${path}`])) as Record<
    Locale,
    string
  >
}

/**
 * Dynamic sitemap — includes all published posts, products, and static pages.
 * Includes hreflang alternates for each locale.
 * Falls back to static-only entries if the database is unavailable.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []
  const now = new Date()

  // Static pages — one entry per locale
  const staticPaths: { path: string; changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency']; priority: number }[] = [
    { path: '', changeFrequency: 'daily', priority: 1.0 },
    { path: '/blog', changeFrequency: 'daily', priority: 0.9 },
    { path: '/products', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.6 },
  ]

  for (const locale of locales) {
    for (const { path, changeFrequency, priority } of staticPaths) {
      entries.push({
        url: `${APP_URL}/${locale}${path}`,
        lastModified: now,
        changeFrequency,
        priority,
        alternates: { languages: buildAlternates(path) },
      })
    }
  }

  if (shouldSkipBuildDbAccess) {
    return entries
  }

  try {
    const [{ getPayload }, { default: config }] = await Promise.all([
      import('payload'),
      import('@payload-config'),
    ])
    const payload = await getPayload({ config })

    // Blog posts
    const posts = await payload.find({
      collection: 'posts',
      where: publishedNowWhere(),
      limit: 1000,
      depth: 0,
    })

    for (const post of posts.docs) {
      const path = `/blog/${post.slug}`
      const lastMod = post.updatedAt ? new Date(post.updatedAt) : now
      for (const locale of locales) {
        entries.push({
          url: `${APP_URL}/${locale}${path}`,
          lastModified: lastMod,
          changeFrequency: 'monthly',
          priority: 0.7,
          alternates: { languages: buildAlternates(path) },
        })
      }
    }

    // Products
    const products = await payload.find({
      collection: 'products',
      where: { status: { equals: 'published' } },
      limit: 1000,
      depth: 0,
    })

    for (const product of products.docs) {
      const path = `/products/${product.slug}`
      const lastMod = product.updatedAt ? new Date(product.updatedAt) : now
      for (const locale of locales) {
        entries.push({
          url: `${APP_URL}/${locale}${path}`,
          lastModified: lastMod,
          changeFrequency: 'monthly',
          priority: 0.6,
          alternates: { languages: buildAlternates(path) },
        })
      }
    }

    // CMS pages served by /[locale]/[slug]. Reserved slugs are handled by
    // dedicated static routes above and should not be duplicated here.
    const pages = await payload.find({
      collection: 'pages',
      where: publishedNowWhere(),
      limit: 1000,
      depth: 0,
    })

    for (const page of pages.docs) {
      if (!page.slug || reservedCmsPageSlugs.has(String(page.slug))) continue
      const path = `/${page.slug}`
      const lastMod = page.updatedAt ? new Date(page.updatedAt) : now
      for (const locale of locales) {
        entries.push({
          url: `${APP_URL}/${locale}${path}`,
          lastModified: lastMod,
          changeFrequency: 'monthly',
          priority: 0.5,
          alternates: { languages: buildAlternates(path) },
        })
      }
    }
  } catch {
    // DB unavailable — return static entries only; Next.js will regenerate on next request
  }

  return entries
}
