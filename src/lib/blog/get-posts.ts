import type { Where } from 'payload'
import { mergePublishedNowWhere } from '@/lib/content/publication-state'

const shouldSkipBuildDbAccess = process.env.SKIP_BUILD_DB_ACCESS === 'true'

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
  if (shouldSkipBuildDbAccess) {
    return {
      docs: [],
      totalDocs: 0,
      limit,
      totalPages: 0,
      page,
      pagingCounter: 1,
      hasPrevPage: false,
      hasNextPage: false,
      prevPage: null,
      nextPage: null,
    }
  }

  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('@payload-config'),
  ])
  const payload = await getPayload({ config })

  const where: Where = status === 'published' ? mergePublishedNowWhere() : { status: { equals: status } }
  if (category) {
    // Filter by category slug via relationship
    const categoryWhere: Where = { 'category.slug': { equals: category } }
    if ('and' in where && Array.isArray(where.and)) where.and.push(categoryWhere)
    else where['category.slug'] = { equals: category }
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
