import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Fetch related posts in the same category, excluding the current post.
 * Used on blog detail page to surface related content.
 */
export async function getRelatedPosts(
  currentSlug: string,
  categoryId: string,
  locale: 'vi' | 'en' = 'vi',
  limit = 3
) {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'posts',
    locale,
    where: {
      slug: { not_equals: currentSlug },
      category: { equals: categoryId },
      status: { equals: 'published' },
    },
    sort: '-publishedAt',
    limit,
    depth: 1,
  })

  return result.docs
}
