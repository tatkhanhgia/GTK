import type { Where } from 'payload'

const shouldSkipBuildDbAccess = process.env.SKIP_BUILD_DB_ACCESS === 'true'

interface GetProductsOptions {
  locale?: 'vi' | 'en'
  type?: 'ebook' | 'template' | 'code'
  page?: number
  limit?: number
}

/**
 * Fetch published products from Payload CMS with optional filters.
 * Prices are always fetched server-side — never trust client-supplied values.
 */
export async function getProducts({
  locale = 'vi',
  type,
  page = 1,
  limit = 12,
}: GetProductsOptions = {}) {
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

  const where: Where = { status: { equals: 'published' } }
  if (type) where['type'] = { equals: type }

  return payload.find({
    collection: 'products',
    locale,
    where,
    sort: '-createdAt',
    page,
    limit,
    depth: 2,
  })
}
