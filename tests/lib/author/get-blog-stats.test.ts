import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  find: vi.fn(),
  execute: vi.fn(),
}))

vi.mock('payload', () => ({
  getPayload: vi.fn(async () => ({
    find: mocks.find,
    db: {
      drizzle: {
        execute: mocks.execute,
      },
    },
  })),
}))

vi.mock('@payload-config', () => ({
  default: {},
}))

describe('getBlogStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.find
      .mockResolvedValueOnce({ totalDocs: 4 })
      .mockResolvedValueOnce({ totalDocs: 2 })
      .mockResolvedValueOnce({ totalDocs: 3 })
    mocks.execute.mockResolvedValue({ rows: [{ count: 5 }] })
  })

  it('counts only published-now posts for homepage stats', async () => {
    const { getBlogStats } = await import('@/lib/author/get-blog-stats')

    const stats = await getBlogStats('en')

    expect(mocks.find).toHaveBeenNthCalledWith(1, expect.objectContaining({
      collection: 'posts',
      where: expect.objectContaining({
        and: expect.arrayContaining([
          { status: { equals: 'published' } },
        ]),
      }),
    }))
    expect(mocks.find.mock.calls[0]?.[0]).toMatchObject({
      where: {
        and: [
          { status: { equals: 'published' } },
          {
            or: [
              { publishedAt: { exists: false } },
              { publishedAt: { less_than_equal: expect.any(String) } },
            ],
          },
        ],
      },
    })
    expect(stats[0]).toMatchObject({ label: 'Articles published', value: 4, suffix: '+' })
  })
})
