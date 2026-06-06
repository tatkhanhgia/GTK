import { createHash } from 'crypto'

export type AdminAiFileChunkInput = {
  chunkIndex: number
  content: string
  charStart: number
  charEnd: number
  checksum: string
}

export const ADMIN_AI_CHUNK_SIZE_CHARS = 4000
export const ADMIN_AI_CHUNK_OVERLAP_CHARS = 250

const ENTITY_MAP: Record<string, string> = {
  amp: '&',
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
  apos: "'",
}

export function checksumAdminAiText(text: string) {
  return createHash('sha256').update(text).digest('hex')
}

export function normalizeAdminAiRawText(text: string) {
  return text.replace(/\r\n?/g, '\n').replace(/^\uFEFF/, '').trim()
}

function decodeBasicHtmlEntities(text: string) {
  return text.replace(/&(#\d+|#x[\da-f]+|[a-z]+);/gi, (match, entity: string) => {
    const key = entity.toLowerCase()
    if (key.startsWith('#x')) return String.fromCodePoint(Number.parseInt(key.slice(2), 16))
    if (key.startsWith('#')) return String.fromCodePoint(Number.parseInt(key.slice(1), 10))
    return ENTITY_MAP[key] ?? match
  })
}

export function stripHtmlForAiContext(text: string) {
  return decodeBasicHtmlEntities(
    text
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<(script|style|noscript|template)\b[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<\/(p|div|section|article|li|h[1-6]|tr|blockquote)>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ' '),
  )
}

export function normalizeAdminAiFileText(text: string, extension: string) {
  const normalized = normalizeAdminAiRawText(text)
  const cleaned = extension === '.html' || extension === '.htm'
    ? stripHtmlForAiContext(normalized)
    : normalized

  return cleaned
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

export function chunkAdminAiText(
  text: string,
  chunkSize = ADMIN_AI_CHUNK_SIZE_CHARS,
  overlap = ADMIN_AI_CHUNK_OVERLAP_CHARS,
): AdminAiFileChunkInput[] {
  if (!text) return []
  const chunks: AdminAiFileChunkInput[] = []
  let start = 0
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    const content = text.slice(start, end).trim()
    if (content) {
      chunks.push({
        chunkIndex: chunks.length,
        content,
        charStart: start,
        charEnd: end,
        checksum: checksumAdminAiText(content),
      })
    }
    if (end === text.length) break
    start = Math.max(end - overlap, start + 1)
  }
  return chunks
}
