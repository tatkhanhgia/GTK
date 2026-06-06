import { describe, expect, it } from 'vitest'
import { validateAdminAiUploadFile } from '@/lib/admin-ai/files/admin-ai-file-validation'

function textFile(name: string, text: string, type = 'text/plain') {
  const bytes = new TextEncoder().encode(text)
  return {
    name,
    type,
    size: bytes.byteLength,
    arrayBuffer: () => Promise.resolve(bytes.buffer as ArrayBuffer),
  }
}

describe('admin AI file validation', () => {
  it('accepts supported UTF-8 text files', async () => {
    const result = await validateAdminAiUploadFile(textFile('draft.md', '# Hello'))

    expect(result).toMatchObject({ filename: 'draft.md', extension: '.md', byteSize: 7 })
  })

  it('rejects unsupported extensions', async () => {
    await expect(validateAdminAiUploadFile(textFile('draft.pdf', 'x'))).rejects.toThrow('Only Markdown')
  })

  it('rejects binary markers', async () => {
    await expect(validateAdminAiUploadFile(textFile('draft.txt', 'hello\u0000world'))).rejects.toThrow('Binary')
  })
})
