import { describe, expect, it } from 'vitest'
import { Media } from '@/collections/media'

describe('media collection access', () => {
  it('allows anonymous document reads so public pages can list media metadata', async () => {
    const canRead = await Media.access?.read?.({
      isReadingStaticFile: false,
      req: {},
    } as never)

    expect(canRead).toBe(true)
  })

  it('allows anonymous static file reads so thumbnails render on the public site', async () => {
    const canRead = await Media.access?.read?.({
      isReadingStaticFile: true,
      req: {},
    } as never)

    expect(canRead).toBe(true)
  })

  it('denies anonymous create access', async () => {
    const canCreate = await Media.access?.create?.({
      req: {},
    } as never)

    expect(canCreate).toBe(false)
  })

  it('allows admin create access', async () => {
    const canCreate = await Media.access?.create?.({
      req: { user: { id: 'admin-1', role: 'admin' } },
    } as never)

    expect(canCreate).toBe(true)
  })

  it('denies anonymous update access', async () => {
    const canUpdate = await Media.access?.update?.({
      req: {},
    } as never)

    expect(canUpdate).toBe(false)
  })

  it('denies anonymous delete access', async () => {
    const canDelete = await Media.access?.delete?.({
      req: {},
    } as never)

    expect(canDelete).toBe(false)
  })
})
