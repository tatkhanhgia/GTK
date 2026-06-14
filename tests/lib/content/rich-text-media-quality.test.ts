import { describe, expect, it } from 'vitest'
import {
  assertRichTextMediaQuality,
  findRichTextMediaQualityIssues,
} from '@/lib/content/rich-text-media-quality'

function richTextWithUpload(value: unknown, fields: Record<string, unknown> = {}) {
  return {
    root: {
      children: [
        {
          fields,
          relationTo: 'media',
          type: 'upload',
          value,
          version: 3,
        },
      ],
      type: 'root',
      version: 1,
    },
  }
}

describe('rich text media quality', () => {
  it('requires alt and caption for populated inline images', () => {
    const issues = findRichTextMediaQualityIssues(richTextWithUpload({
      mimeType: 'image/png',
      url: '/media/diagram.png',
    }))

    expect(issues.map((issue) => issue.message)).toEqual([
      'Inline image 1 is missing alt text.',
      'Inline image 1 is missing a caption.',
    ])
  })

  it('accepts alt and caption from node fields or media document', () => {
    expect(findRichTextMediaQualityIssues(richTextWithUpload({
      alt: 'Diagram',
      caption: 'System flow',
      mimeType: 'image/png',
      url: '/media/diagram.png',
    }))).toEqual([])

    expect(findRichTextMediaQualityIssues(richTextWithUpload({
      mimeType: 'image/png',
      url: '/media/diagram.png',
    }, {
      alt: 'Field alt',
      caption: 'Field caption',
    }))).toEqual([])
  })

  it('skips unpopulated upload ids to avoid false positives', () => {
    expect(findRichTextMediaQualityIssues(richTextWithUpload('media-1'))).toEqual([])
  })

  it('throws a publish-ready error summary', () => {
    expect(() => assertRichTextMediaQuality(richTextWithUpload({ url: '/media/diagram.png' })))
      .toThrow('Fix inline media before publishing')
  })
})
