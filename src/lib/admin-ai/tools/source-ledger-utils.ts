import { AdminAiError } from '../admin-ai-chat-contract'
import { createHmac, timingSafeEqual } from 'crypto'

export type SourceLedgerKind = 'web' | 'file' | 'existing-post' | 'admin-note'

export type SourceLedgerEntry = {
  kind: SourceLedgerKind
  title: string
  retrievedAt: string
  summary: string
  confidence: 'low' | 'medium' | 'high'
  url?: string
  sourceId?: string
  receipt?: string
}

const INSTRUCTION_PATTERNS = [
  /ignore (all )?(previous|prior|system|developer) instructions/gi,
  /reveal (secrets?|tokens?|passwords?|keys?)/gi,
  /you are now/gi,
  /system prompt/gi,
]

export function sanitizeSourceSummary(value: unknown, maxLength = 900) {
  const raw = typeof value === 'string' ? value : ''
  const collapsed = raw.replace(/\s+/g, ' ').trim().slice(0, maxLength)
  return INSTRUCTION_PATTERNS.reduce(
    (text, pattern) => text.replace(pattern, '[untrusted instruction removed]'),
    collapsed,
  )
}

function getString(record: Record<string, unknown>, key: string, maxLength: number) {
  const value = record[key]
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function isSourceKind(value: unknown): value is SourceLedgerKind {
  return value === 'web' || value === 'file' || value === 'existing-post' || value === 'admin-note'
}

function isConfidence(value: unknown): value is SourceLedgerEntry['confidence'] {
  return value === 'low' || value === 'medium' || value === 'high'
}

function getAdminId(user: unknown) {
  const id = user && typeof user === 'object' ? (user as Record<string, unknown>).id : undefined
  return typeof id === 'string' || typeof id === 'number' ? String(id) : ''
}

function receiptSecret() {
  return process.env.ADMIN_AI_SOURCE_RECEIPT_SECRET || process.env.PAYLOAD_SECRET || 'dev-secret-change-me'
}

function receiptPayload(entry: SourceLedgerEntry, adminUser: unknown) {
  return JSON.stringify({
    adminUserId: getAdminId(adminUser),
    kind: entry.kind,
    title: entry.title,
    retrievedAt: entry.retrievedAt,
    summary: entry.summary,
    confidence: entry.confidence,
    url: entry.url ?? '',
    sourceId: entry.sourceId ?? '',
  })
}

function signPayload(payload: string) {
  return createHmac('sha256', receiptSecret()).update(payload).digest('base64url')
}

export function normalizeSourceLedger(value: unknown): SourceLedgerEntry[] {
  if (!Array.isArray(value)) return []

  return value.slice(0, 20).map((item) => {
    const record = item && typeof item === 'object' ? item as Record<string, unknown> : {}
    const kind = isSourceKind(record.kind) ? record.kind : undefined
    const title = getString(record, 'title', 180)
    const summary = sanitizeSourceSummary(record.summary)

    if (!kind || !title || !summary) {
      throw new AdminAiError('BAD_REQUEST', 'Each source ledger entry needs kind, title, and summary.', 400)
    }

    const url = getString(record, 'url', 500)
    if (kind === 'web' && !/^https?:\/\//i.test(url)) {
      throw new AdminAiError('BAD_REQUEST', 'Web source ledger entries need an HTTP(S) URL.', 400)
    }

    return {
      kind,
      title,
      retrievedAt: getString(record, 'retrievedAt', 80) || new Date().toISOString(),
      summary,
      confidence: isConfidence(record.confidence) ? record.confidence : 'medium',
      ...(url ? { url } : {}),
      ...(getString(record, 'sourceId', 120) ? { sourceId: getString(record, 'sourceId', 120) } : {}),
      ...(getString(record, 'receipt', 2000) ? { receipt: getString(record, 'receipt', 2000) } : {}),
    }
  })
}

export function hasAdequateSources(entries: SourceLedgerEntry[]) {
  return entries.some((entry) => entry.confidence !== 'low' && entry.summary.length >= 40)
}

export function attachSourceReceipts(entries: SourceLedgerEntry[], adminUser: unknown): SourceLedgerEntry[] {
  if (!getAdminId(adminUser)) return entries
  return entries.map((entry) => {
    const payload = receiptPayload(entry, adminUser)
    return { ...entry, receipt: `admin-ai-src:v1:${Buffer.from(payload).toString('base64url')}.${signPayload(payload)}` }
  })
}

export function verifySourceLedgerReceipts(value: unknown, adminUser: unknown): SourceLedgerEntry[] {
  return normalizeSourceLedger(value).filter((entry) => {
    const receipt = entry.receipt ?? ''
    const match = receipt.match(/^admin-ai-src:v1:([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)$/)
    if (!match) return false

    const payload = Buffer.from(match[1], 'base64url').toString('utf8')
    if (payload !== receiptPayload({ ...entry, receipt: undefined }, adminUser)) return false

    const expected = Buffer.from(signPayload(payload))
    const actual = Buffer.from(match[2])
    return expected.length === actual.length && timingSafeEqual(expected, actual)
  })
}
