import { getPayload } from 'payload'
import type { Where } from 'payload'
import config from '@payload-config'

interface GetPostsOptions {
  locale?: 'vi' | 'en'
  category?: string // category slug
  page?: number
  limit?: number
  status?: 'draft' | 'published'
}

/**
 * Fetch paginated posts from Payload CMS using the Local API.
 * Filters by locale, category slug, and publish status.
 */
export async function getPosts({
  locale = 'vi',
  category,
  page = 1,
  limit = 12,
  status = 'published',
}: GetPostsOptions = {}) {
  const payload = await getPayload({ config })

  const where: Where = { status: { equals: status } }
  if (category) {
    // Filter by category slug via relationship
    where['category.slug'] = { equals: category }
  }

  const result = await payload.find({
    collection: 'posts',
    locale,
    where,
    sort: '-publishedAt',
    page,
    limit,
    depth: 2,
  })

  return result
}
