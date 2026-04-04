import type { MetadataRoute } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/**
 * robots.txt — allows all crawlers on public pages, blocks admin, API, and auth routes.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/', '/(auth)/'],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}
