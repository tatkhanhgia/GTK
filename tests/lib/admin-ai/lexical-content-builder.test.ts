import { describe, expect, it } from 'vitest'
import { createRichTextFromContentPack } from '@/lib/admin-ai/tools/lexical-content-builder'

describe('lexical content builder', () => {
  it('builds headings, lists, code, quotes, and safe links', () => {
    const richText = createRichTextFromContentPack({
      blocks: [
        { type: 'heading', level: 2, text: 'Overview' },
        { type: 'paragraph', children: ['Read ', { text: 'the guide', url: '/guide' }] },
        { type: 'list', items: ['One', 'Two'] },
        { type: 'quote', text: 'Use sources.' },
        { type: 'code', language: 'ts', text: 'const ok = true' },
      ],
    })

    expect(richText.root.children).toMatchObject([
      { type: 'heading', tag: 'h2' },
      { type: 'paragraph' },
      { type: 'list', listType: 'bullet' },
      { type: 'quote' },
      { type: 'code', language: 'ts' },
    ])
    expect(JSON.stringify(richText)).toContain('"type":"link"')
  })

  it('rejects unsupported blocks and unsafe links', () => {
    expect(() => createRichTextFromContentPack({
      blocks: [{ type: 'paragraph', children: [{ text: 'bad', url: 'javascript:alert(1)' }] }],
    })).toThrow('Links must use')
    expect(() => createRichTextFromContentPack({ blocks: [{ type: 'html', text: '<b>x</b>' }] })).toThrow('Unsupported')
  })
})

