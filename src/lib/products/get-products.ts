import { getPayload } from 'payload'
import config from '@payload-config'
import type { Where } from 'payload'

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
