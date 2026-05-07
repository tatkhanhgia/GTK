const shouldSkipBuildDbAccess = process.env.SKIP_BUILD_DB_ACCESS === 'true'

/**
 * Fetch a single published post by slug + locale.
 * Returns null if not found or not published.
 */
export async function getPostBySlug(slug: string, locale: 'vi' | 'en' = 'vi') {
  if (shouldSkipBuildDbAccess) {
    return null
  }

  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('@payload-config'),
  ])
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'posts',
    locale,
    where: {
      slug: { equals: slug },
      status: { equals: 'published' },
    },
    limit: 1,
    depth: 2,
  })

  return result.docs[0] ?? null
}
