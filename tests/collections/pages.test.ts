import { describe, expect, it } from 'vitest'
import { Pages } from '@/collections/pages'

describe('pages collection hooks', () => {
  it('blocks publish when populated inline media lacks alt or caption', async () => {
    const hook = Pages.hooks?.beforeChange?.[0]
    expect(hook).toBeDefined()

    expect(() => hook?.({
      data: {
        status: 'published',
        content: {
          root: {
            children: [
              {
                fields: {},
                relationTo: 'media',
                type: 'upload',
                value: { mimeType: 'image/png', url: '/media/page-diagram.png' },
                version: 3,
              },
            ],
          },
        },
      },
      originalDoc: {},
    } as never)).toThrow('Fix inline media before publishing')
  })

  it('allows publish when inline media has alt and caption', async () => {
    const hook = Pages.hooks?.beforeChange?.[0]

    const result = await hook?.({
      data: {
        status: 'published',
        content: {
          root: {
            children: [
              {
                fields: { alt: 'Diagram', caption: 'Page flow' },
                relationTo: 'media',
                type: 'upload',
                value: { mimeType: 'image/png', url: '/media/page-diagram.png' },
                version: 3,
              },
            ],
          },
        },
      },
      originalDoc: {},
    } as never)

    expect(result).toMatchObject({ status: 'published' })
  })
})
