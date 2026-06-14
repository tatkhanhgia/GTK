import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { RichTextRenderer } from '@/components/blog/rich-text-renderer'

describe('RichTextRenderer', () => {
  it('renders uploaded media as an accessible figure with caption', () => {
    const html = renderToString(
      <RichTextRenderer
        content={{
          root: {
            children: [
              {
                fields: { alt: 'System diagram', caption: 'How the request moves through the app' },
                format: '',
                id: 'node-1',
                relationTo: 'media',
                type: 'upload',
                value: {
                  alt: 'Fallback alt',
                  caption: 'Fallback caption',
                  height: 720,
                  mimeType: 'image/png',
                  url: '/media/system-diagram.png',
                  width: 1280,
                },
                version: 3,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        }}
      />
    )

    expect(html).toContain('<figure')
    expect(html).toContain('System diagram')
    expect(html).toContain('How the request moves through the app')
    expect(html).toContain('%2Fmedia%2Fsystem-diagram.png')
  })
})
