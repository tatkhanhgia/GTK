import { describe, expect, it } from 'vitest'
import {
  chunkAdminAiText,
  normalizeAdminAiFileText,
  normalizeAdminAiRawText,
} from '@/lib/admin-ai/files/admin-ai-file-text-processing'

describe('admin AI file text processing', () => {
  it('normalizes newlines and strips BOM', () => {
    expect(normalizeAdminAiRawText('\uFEFFone\r\ntwo\rthree')).toBe('one\ntwo\nthree')
  })

  it('strips unsafe HTML for AI context', () => {
    const text = normalizeAdminAiFileText('<h1>Title</h1><script>alert(1)</script><p>A&nbsp;B</p>', '.html')

    expect(text).toContain('Title')
    expect(text).toContain('A B')
    expect(text).not.toContain('script')
    expect(text).not.toContain('alert')
  })

  it('chunks bounded content in order', () => {
    const chunks = chunkAdminAiText('abcdefghij', 4, 1)

    expect(chunks.map((chunk) => chunk.content)).toEqual(['abcd', 'defg', 'ghij'])
    expect(chunks[0]).toMatchObject({ chunkIndex: 0, charStart: 0, charEnd: 4 })
  })
})
