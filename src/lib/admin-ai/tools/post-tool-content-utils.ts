import { AdminAiError } from '../admin-ai-chat-contract'

export type LocalePostInput = {
  title: string
  slug?: string
  excerpt?: string
  contentParagraphs: string[]
}

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {}
}

export function getLocalizedText(value: unknown) {
  if (typeof value === 'string') return value
  const record = asRecord(value)
  return String(record.vi ?? record.en ?? '')
}

export function getText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

export function getOptionalText(value: unknown, maxLength: number) {
  const text = getText(value, maxLength)
  return text || undefined
}

function getParagraphs(value: unknown) {
  const raw = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/\n{2,}/)
      : []

  return raw
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim().replace(/\s+/g, ' ').slice(0, 1200))
    .filter(Boolean)
    .slice(0, 40)
}

export function parseLocalePostInput(value: unknown, locale: 'vi' | 'en', required: boolean): LocalePostInput | undefined {
  const record = asRecord(value)
  const title = getText(record.title, 180)
  const slug = getOptionalText(record.slug, 120)
  const excerpt = getOptionalText(record.excerpt, 500)
  const hasContentPack = Boolean(asRecord(record.contentPack).blocks)
  const contentParagraphs = getParagraphs(record.contentParagraphs ?? record.content)

  if (!title && contentParagraphs.length === 0 && !excerpt && !required) return undefined
  if (!title) throw new AdminAiError('BAD_REQUEST', `${locale}.title is required.`, 400)
  if (contentParagraphs.length === 0 && !hasContentPack) {
    throw new AdminAiError('BAD_REQUEST', `${locale}.contentParagraphs must contain at least one paragraph.`, 400)
  }

  return { title, slug, excerpt, contentParagraphs }
}

export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\u0111/g, 'd')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90)
}

export function createRichText(paragraphs: string[]) {
  return {
    root: {
      children: paragraphs.map((text) => ({
        children: [{ detail: 0, format: 0, mode: 'normal', style: '', text, type: 'text', version: 1 }],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        type: 'paragraph',
        version: 1,
        textFormat: 0,
        textStyle: '',
      })),
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

export function getPostId(value: unknown) {
  const record = asRecord(value)
  const id = record.id
  return typeof id === 'string' || typeof id === 'number' ? String(id) : ''
}

export function getTagRows(value: unknown) {
  if (!Array.isArray(value)) return undefined
  const tags = value
    .filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
    .map((tag) => ({ tag: tag.trim().slice(0, 64) }))
    .slice(0, 12)
  return tags.length ? tags : undefined
}
