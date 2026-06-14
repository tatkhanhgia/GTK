import { mergePublishedNowWhere } from '@/lib/content/publication-state'

const shouldSkipBuildDbAccess = process.env.SKIP_BUILD_DB_ACCESS === 'true'

export async function getCmsPageBySlug(slug: string, locale: 'vi' | 'en' = 'vi') {
  if (shouldSkipBuildDbAccess) return null

  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('@payload-config'),
  ])
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'pages',
    locale,
    where: mergePublishedNowWhere({ slug: { equals: slug } }),
    limit: 1,
    depth: 2,
  })

  return result.docs[0] ?? null
}
