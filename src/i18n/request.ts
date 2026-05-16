import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

async function loadStaticMessages(locale: string) {
  try {
    return (await import(`../../messages/${locale}.json`)).default
  } catch {
    return {}
  }
}

function shouldSkipDbTranslations() {
  return process.env.SKIP_DB_TRANSLATIONS === 'true'
}

function buildNestedTree(records: Array<{ key: string; vi: string; en: string }>, locale: string) {
  const tree: Record<string, unknown> = {}

  for (const record of records) {
    const value = (record as Record<string, string>)[locale]
    if (value === undefined || value === null) continue

    const parts = record.key.split('.')
    let current: Record<string, unknown> = tree

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (part === '__proto__' || part === 'constructor' || part === 'prototype') continue

      if (i === parts.length - 1) {
        current[part] = value
      } else {
        if (!current[part] || typeof current[part] !== 'object') {
          current[part] = {}
        }
        current = current[part] as Record<string, unknown>
      }
    }
  }

  return tree
}

export default getRequestConfig(async ({ requestLocale }) => {
  // Validate locale — fall back to default if unknown or undefined
  const requested = await requestLocale
  const locale: string = routing.locales.includes(requested as 'vi' | 'en')
    ? (requested as string)
    : routing.defaultLocale

  let messages: Record<string, unknown> = {}
  if (shouldSkipDbTranslations()) {
    messages = await loadStaticMessages(locale)
  } else {
    try {
      const [{ getPayload }, { default: config }] = await Promise.all([
        import('payload'),
        import('@payload-config'),
      ])
      const payload = await getPayload({ config })
      const result = await payload.find({
        collection: 'translations',
        limit: 1000,
        depth: 0,
        pagination: false,
      })
      const records = result.docs as unknown as Array<{ key: string; vi: string; en: string }>
      messages = records.length > 0 ? buildNestedTree(records, locale) : await loadStaticMessages(locale)
    } catch (err) {
      console.error('[i18n/request] Failed to load translations from DB:', err)
      messages = await loadStaticMessages(locale)
    }
  }

  return {
    locale,
    messages,
  }
})
