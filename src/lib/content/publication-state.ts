import type { Where } from 'payload'

export function publishedNowWhere(now = new Date()): Where {
  return {
    and: [
      { status: { equals: 'published' } },
      {
        or: [
          { publishedAt: { exists: false } },
          { publishedAt: { less_than_equal: now.toISOString() } },
        ],
      },
    ],
  }
}

export function mergePublishedNowWhere(extra?: Where, now = new Date()): Where {
  const base = publishedNowWhere(now)
  return extra ? { and: [base, extra] } : base
}

