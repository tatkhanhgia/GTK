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

describe('getCmsPageBySlug', () => {
  beforeEach(() => {
    vi.resetModules()
    findMock.mockReset()
    delete process.env.SKIP_BUILD_DB_ACCESS
  })

  it('fetches one published-now CMS page by localized slug', async () => {
    findMock.mockResolvedValue({ docs: [{ id: 1, slug: 'custom-page' }] })
    const { getCmsPageBySlug } = await import('@/lib/pages/get-cms-page-by-slug')

    const page = await getCmsPageBySlug('custom-page', 'en')

    expect(page).toMatchObject({ slug: 'custom-page' })
    expect(findMock).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'pages',
      depth: 2,
      limit: 1,
      locale: 'en',
      where: expect.objectContaining({
        and: expect.arrayContaining([
          { slug: { equals: 'custom-page' } },
        ]),
      }),
    }))
  })

  it('skips database access during static builds when configured', async () => {
    process.env.SKIP_BUILD_DB_ACCESS = 'true'
    const { getCmsPageBySlug } = await import('@/lib/pages/get-cms-page-by-slug')

    await expect(getCmsPageBySlug('custom-page', 'vi')).resolves.toBeNull()
    expect(findMock).not.toHaveBeenCalled()
  })
})
