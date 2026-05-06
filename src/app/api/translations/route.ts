import { type NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

const CACHE_TTL_SECONDS = 60

// Simple in-memory cache per Node process
const memoryCache = new Map<string, { data: unknown; expiresAt: number }>()

type AllowedLocale = 'vi' | 'en'

function isPrototypePollutingKey(key: string) {
  return key === '__proto__' || key === 'constructor' || key === 'prototype'
}

function buildNestedTree(records: Array<{ key: string; vi: string; en: string }>, locale: AllowedLocale) {
  const tree: Record<string, unknown> = Object.create(null)

  for (const record of records) {
    const value = record[locale]
    if (value === undefined || value === null) continue

    const parts = record.key.split('.')
    let current: Record<string, unknown> = tree

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (isPrototypePollutingKey(part)) continue

      if (i === parts.length - 1) {
        current[part] = value
      } else {
        if (!current[part] || typeof current[part] !== 'object') {
          current[part] = Object.create(null)
        }
        current = current[part] as Record<string, unknown>
      }
    }
  }

  return tree
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const requestedLocale = searchParams.get('locale')
  const locale: AllowedLocale = requestedLocale === 'en' ? 'en' : 'vi'

  const cacheKey = `translations:${locale}`
  const cached = memoryCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.data, {
      headers: {
        'Cache-Control': `s-maxage=${CACHE_TTL_SECONDS}, stale-while-revalidate`,
      },
    })
  }

  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'translations',
      limit: 1000,
      depth: 0,
      pagination: false,
    })

    const records = result.docs as unknown as Array<{ key: string; vi: string; en: string }>
    const tree = buildNestedTree(records, locale)

    memoryCache.set(cacheKey, {
      data: tree,
      expiresAt: Date.now() + CACHE_TTL_SECONDS * 1000,
    })

    return NextResponse.json(tree, {
      headers: {
        'Cache-Control': `s-maxage=${CACHE_TTL_SECONDS}, stale-while-revalidate`,
      },
    })
  } catch {
    console.error('[api/translations] Failed to fetch translations')

    // Serve stale cache if available
    if (cached) {
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': `s-maxage=${CACHE_TTL_SECONDS}, stale-while-revalidate`,
        },
      })
    }

    return NextResponse.json({}, { status: 500 })
  }
}
