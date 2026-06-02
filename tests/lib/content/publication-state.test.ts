import { describe, expect, it } from 'vitest'
import { mergePublishedNowWhere, publishedNowWhere } from '@/lib/content/publication-state'

describe('publication state filters', () => {
  it('requires published status and due publishedAt', () => {
    expect(publishedNowWhere(new Date('2026-06-01T00:00:00.000Z'))).toEqual({
      and: [
        { status: { equals: 'published' } },
        {
          or: [
            { publishedAt: { exists: false } },
            { publishedAt: { less_than_equal: '2026-06-01T00:00:00.000Z' } },
          ],
        },
      ],
    })
  })

  it('merges slug filters under an AND clause', () => {
    expect(mergePublishedNowWhere({ slug: { equals: 'about' } }, new Date('2026-06-01T00:00:00.000Z'))).toMatchObject({
      and: [
        expect.objectContaining({ and: expect.any(Array) }),
        { slug: { equals: 'about' } },
      ],
    })
  })
})

