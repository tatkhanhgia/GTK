import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Fetch all blog categories (type='blog') from Payload CMS.
 * Used for category filter tabs and sidebar navigation.
 */
export async function getBlogCategories(locale: 'vi' | 'en' = 'vi') {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'categories',
    locale,
    where: { type: { equals: 'blog' } },
    limit: 50,
    depth: 0,
  })

  return result.docs
}
