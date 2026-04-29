import type { Locale } from '@/i18n/config'

const shouldSkipBuildDbAccess = process.env.SKIP_BUILD_DB_ACCESS === 'true'

export async function getAuthorProfile(locale: Locale) {
  if (shouldSkipBuildDbAccess) {
    return null
  }

  try {
    const [{ getPayload }, { default: config }] = await Promise.all([
      import('payload'),
      import('@payload-config'),
    ])
    const payload = await getPayload({ config })
    return await payload.findGlobal({
      slug: 'author-profile',
      locale,
      depth: 2,
    })
  } catch {
    return null
  }
}
