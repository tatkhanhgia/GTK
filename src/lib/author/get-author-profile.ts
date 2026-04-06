import { getPayload } from 'payload'
import config from '@payload-config'
import type { Locale } from '@/i18n/config'

export async function getAuthorProfile(locale: Locale) {
  try {
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
