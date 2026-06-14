import { describe, expect, it } from 'vitest'
import { createRichTextFromContentPack } from '@/lib/admin-ai/tools/lexical-content-builder'

describe('lexical content builder', () => {
  it('builds headings, lists, code, quotes, and safe links', () => {
    const richText = createRichTextFromContentPack({
      blocks: [
        { type: 'heading', level: 2, text: 'Overview' },
        { type: 'paragraph', children: ['Read ', { text: 'the guide', url: '/guide' }] },
        { type: 'image', mediaId: 'media-1', alt: 'Architecture diagram', caption: 'Request flow diagram' },
        { type: 'list', items: ['One', 'Two'] },
        { type: 'quote', text: 'Use sources.' },
        { type: 'code', language: 'ts', text: 'const ok = true' },
      ],
    })

    expect(richText.root.children).toMatchObject([
      { type: 'heading', tag: 'h2' },
      { type: 'paragraph' },
      { type: 'upload', relationTo: 'media', value: 'media-1' },
      { type: 'list', listType: 'bullet' },
      { type: 'quote' },
      { type: 'code', language: 'ts' },
    ])
    expect(JSON.stringify(richText)).toContain('"type":"link"')
    expect(JSON.stringify(richText)).toContain('Request flow diagram')
  })

  it('turns image placeholders into editorial notes', () => {
    const richText = createRichTextFromContentPack({
      blocks: [{ type: 'imagePlaceholder', caption: 'Add a benchmark screenshot after this section.' }],
    })

    expect(richText.root.children[0]).toMatchObject({
      type: 'paragraph',
      children: [{ text: '[Image needed: Add a benchmark screenshot after this section.]' }],
    })
  })

  it('rejects unsupported blocks and unsafe links', () => {
    expect(() => createRichTextFromContentPack({
      blocks: [{ type: 'paragraph', children: [{ text: 'bad', url: 'javascript:alert(1)' }] }],
    })).toThrow('Links must use')
    expect(() => createRichTextFromContentPack({ blocks: [{ type: 'html', text: '<b>x</b>' }] })).toThrow('Unsupported')
    expect(() => createRichTextFromContentPack({
      blocks: [{ type: 'image', mediaId: 'asset-1', relationTo: 'digital-downloads' }],
    })).toThrow('Image blocks only support')
  })
})

