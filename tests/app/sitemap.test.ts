import { beforeEach, describe, expect, it, vi } from 'vitest'

const findMock = vi.fn()

vi.mock('payload', () => ({
  getPayload: vi.fn(async () => ({
    find: findMock,
  })),
}))

vi.mock('@payload-config', () => ({
  default: {},
}))

describe('sitemap', () => {
  beforeEach(() => {
    vi.resetModules()
    findMock.mockReset()
    delete process.env.SKIP_BUILD_DB_ACCESS
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
  })

  it('includes published CMS pages served by the dynamic page route', async () => {
    findMock.mockImplementation(async ({ collection }) => {
      if (collection === 'posts') return { docs: [] }
      if (collection === 'products') return { docs: [] }
      if (collection === 'pages') {
        return {
          docs: [
            { slug: 'custom-page', updatedAt: '2026-06-01T00:00:00.000Z' },
            { slug: 'about', updatedAt: '2026-06-01T00:00:00.000Z' },
          ],
        }
      }
      return { docs: [] }
    })

    const { default: sitemap } = await import('@/app/sitemap')
    const entries = await sitemap()

    expect(entries.some((entry) => entry.url === 'http://localhost:3000/vi/custom-page')).toBe(true)
    expect(entries.some((entry) => entry.url === 'http://localhost:3000/en/custom-page')).toBe(true)
    expect(entries.filter((entry) => entry.url === 'http://localhost:3000/vi/about')).toHaveLength(1)
  })
})
