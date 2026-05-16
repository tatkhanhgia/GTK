import type { Locale } from '@/i18n/config'

export type HomepageMarquee = {
  enabled: boolean
  eyebrow: string
  items: string[]
  durationSeconds: number
}

const MIN_DURATION_SECONDS = 12
const MAX_DURATION_SECONDS = 180
const DEFAULT_DURATION_SECONDS = 48

const DEFAULT_MARQUEE: Record<Locale, Pick<HomepageMarquee, 'eyebrow' | 'items'>> = {
  vi: {
    eyebrow: 'Dang tap trung',
    items: ['AI thuc chien', 'Next.js va Payload', 'San pham so'],
  },
  en: {
    eyebrow: 'Now exploring',
    items: ['Practical AI', 'Next.js and Payload', 'Digital products'],
  },
}

function getLocalizedText(value: unknown, locale: Locale): string | undefined {
  if (typeof value === 'string') return value
  if (!value || typeof value !== 'object') return undefined

  const record = value as Record<string, unknown>
  const localized = record[locale]
  if (typeof localized === 'string') return localized

  const first = Object.values(record).find((item) => typeof item === 'string')
  return typeof first === 'string' ? first : undefined
}

function clampDurationSeconds(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return DEFAULT_DURATION_SECONDS
  return Math.min(Math.max(value, MIN_DURATION_SECONDS), MAX_DURATION_SECONDS)
}

export function getHomepageMarquee(authorProfile: unknown, locale: Locale): HomepageMarquee | null {
  const defaults = DEFAULT_MARQUEE[locale] ?? DEFAULT_MARQUEE.vi
  const profile = authorProfile as Record<string, unknown> | null | undefined
  const marquee = profile?.homepageMarquee as Record<string, unknown> | null | undefined

  if (marquee?.enabled === false) return null

  const eyebrow = getLocalizedText(marquee?.eyebrow, locale)?.trim() || defaults.eyebrow
  const adminItems = Array.isArray(marquee?.items) ? marquee.items : []
  const items = adminItems
    .map((item) => {
      const label = getLocalizedText((item as Record<string, unknown> | null | undefined)?.label, locale)
      return label?.trim()
    })
    .filter((item): item is string => Boolean(item))

  return {
    enabled: true,
    eyebrow,
    items: items.length > 0 ? items : defaults.items,
    durationSeconds: clampDurationSeconds(marquee?.durationSeconds),
  }
}
