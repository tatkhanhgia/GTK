const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/**
 * JSON-LD schema generators for structured data injection.
 * All functions return plain objects — caller serialises via JSON.stringify.
 */

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GTKBlog',
    url: APP_URL,
    logo: `${APP_URL}/logo.png`,
    sameAs: [] as string[],
  }
}

export function articleSchema({
  title,
  excerpt,
  authorName,
  publishedAt,
  imageUrl,
  url,
}: {
  title: string
  excerpt?: string
  authorName: string
  publishedAt?: string
  imageUrl?: string
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: excerpt,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'GTKBlog',
      url: APP_URL,
    },
    datePublished: publishedAt,
    url,
    ...(imageUrl ? { image: imageUrl } : {}),
  }
}

export function productSchema({
  name,
  description,
  price,
  currency,
  url,
  imageUrl,
}: {
  name: string
  description?: string
  price: number
  currency: string
  url: string
  imageUrl?: string
}) {
  // VND prices are stored as whole units; USD/other as cents — normalise to display unit
  const displayPrice = currency === 'VND' ? price : price / 100

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    url,
    ...(imageUrl ? { image: imageUrl } : {}),
    offers: {
      '@type': 'Offer',
      price: displayPrice,
      priceCurrency: currency,
      availability: 'https://schema.org/InStock',
    },
  }
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
