import type { Metadata } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

interface BaseMetadataOptions {
  title: string
  description?: string
  locale?: string
  path?: string
  imageUrl?: string
  type?: 'website' | 'article'
}

/**
 * Builds a complete Next.js Metadata object with canonical URL,
 * hreflang alternates, Open Graph, and Twitter card tags.
 */
export function buildMetadata({
  title,
  description,
  locale = 'vi',
  path = '',
  imageUrl,
  type = 'website',
}: BaseMetadataOptions): Metadata {
  const url = `${APP_URL}/${locale}${path}`
  const altLocale = locale === 'vi' ? 'en' : 'vi'
  const altUrl = `${APP_URL}/${altLocale}${path}`

  const ogLocale = locale === 'vi' ? 'vi_VN' : 'en_US'
  const ogAltLocale = locale === 'vi' ? 'en_US' : 'vi_VN'

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        [locale]: url,
        [altLocale]: altUrl,
      },
    },
    openGraph: {
      title,
      description,
      url,
      locale: ogLocale,
      alternateLocale: ogAltLocale,
      siteName: 'GTKBlog',
      type,
      ...(imageUrl
        ? { images: [{ url: imageUrl, width: 1200, height: 630, alt: title }] }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  }
}
