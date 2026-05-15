import { describe, expect, it } from 'vitest'
import { DigitalDownloads } from '@/collections/digital-downloads'

describe('digital-downloads collection access', () => {
  it('allows authenticated document reads outside static file serving', async () => {
    const canRead = await DigitalDownloads.access?.read?.({
      isReadingStaticFile: false,
      req: { user: { id: 'admin-1', role: 'admin' } },
    } as never)

    expect(canRead).toBe(true)
  })

  it('denies editor document access for paid download metadata', async () => {
    const canRead = await DigitalDownloads.access?.read?.({
      isReadingStaticFile: false,
      req: { user: { id: 'editor-1', role: 'editor' } },
    } as never)

    expect(canRead).toBe(false)
  })

  it('denies direct file endpoint reads even for authenticated users', async () => {
    const canRead = await DigitalDownloads.access?.read?.({
      isReadingStaticFile: true,
      req: { user: { id: 'admin-1', role: 'admin' } },
    } as never)

    expect(canRead).toBe(false)
  })

  it('returns a blocking response from upload handlers for direct file fetches', async () => {
    const uploadConfig =
      typeof DigitalDownloads.upload === 'object' ? DigitalDownloads.upload : undefined
    const handler = uploadConfig?.handlers?.[0]

    expect(handler).toBeDefined()

    const response = await handler?.({} as never, {
      doc: { id: 'file-1' },
      headers: new Headers(),
      params: {
        collection: 'digital-downloads',
        filename: 'ebook.pdf',
      },
    })

    expect(response).toBeInstanceOf(Response)
    expect(response?.status).toBe(404)
    expect(await response?.text()).toBe('Not found')
  })
})
