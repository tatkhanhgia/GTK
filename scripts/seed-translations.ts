import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import config from '../payload.config'
import { customTranslations } from '../src/admin/i18n/custom-translations'

function flattenObject(obj: unknown, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {}

  if (obj === null || typeof obj !== 'object') {
    return result
  }

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') {
      result[newKey] = value
    } else if (typeof value === 'object' && value !== null) {
      const nested = flattenObject(value, newKey)
      Object.assign(result, nested)
    }
  }

  return result
}

function deriveGroup(key: string): string {
  const firstPart = key.split('.')[0]
  // Map top-level namespaces to logical groups for the admin list view
  if (['customHeader', 'customSidebar', 'customDashboard', 'customCells', 'customFields'].includes(firstPart)) {
    return 'admin'
  }
  if (['nav', 'common', 'home', 'blog', 'products', 'auth', 'profile', 'me', 'privacy', 'footer'].includes(firstPart)) {
    return 'site'
  }
  return firstPart
}

async function main() {
  const payload = await getPayload({ config })

  // 1. Load static JSON files
  const messagesDir = path.resolve(process.cwd(), 'messages')
  let viJson: unknown
  let enJson: unknown
  try {
    viJson = JSON.parse(fs.readFileSync(path.join(messagesDir, 'vi.json'), 'utf-8'))
    enJson = JSON.parse(fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf-8'))
  } catch (err) {
    console.error('Failed to read messages JSON files:', err)
    process.exit(1)
  }

  const viFlat = flattenObject(viJson)
  const enFlat = flattenObject(enJson)

  // 2. Load admin custom translations
  const adminViFlat = flattenObject(customTranslations.vi)
  const adminEnFlat = flattenObject(customTranslations.en)

  // 3. Merge all keys
  const allKeys = new Set([
    ...Object.keys(viFlat),
    ...Object.keys(enFlat),
    ...Object.keys(adminViFlat),
    ...Object.keys(adminEnFlat),
  ])

  const merged: Record<string, { vi: string; en: string; context?: string; group: string }> = {}

  for (const key of allKeys) {
    // Admin keys take precedence over site JSON keys
    const vi = adminViFlat[key] ?? viFlat[key] ?? ''
    const en = adminEnFlat[key] ?? enFlat[key] ?? ''

    if (!vi && !en) continue

    merged[key] = {
      vi,
      en,
      group: deriveGroup(key),
    }
  }

  // 4. Upsert into Translations collection (idempotent by key)
  let created = 0
  let updated = 0

  for (const [key, data] of Object.entries(merged)) {
    const existing = await payload.find({
      collection: 'translations',
      where: { key: { equals: key } },
      limit: 1,
      depth: 0,
    })

    if (existing.docs.length > 0) {
      const doc = existing.docs[0]
      await payload.update({
        collection: 'translations',
        id: doc.id,
        data: {
          vi: data.vi,
          en: data.en,
          group: data.group,
        },
      })
      updated++
    } else {
      await payload.create({
        collection: 'translations',
        data: {
          key,
          vi: data.vi,
          en: data.en,
          group: data.group,
        },
      })
      created++
    }
  }

  console.log(`Seeding complete: ${created} created, ${updated} updated.`)
  console.log(`Total keys: ${Object.keys(merged).length}`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
