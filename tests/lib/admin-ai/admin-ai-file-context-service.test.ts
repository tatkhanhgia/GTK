import { describe, expect, it, vi } from 'vitest'
import { loadAdminAiAttachmentContext } from '@/lib/admin-ai/files/admin-ai-file-context-service'

function createPayload(chunks: Record<string, unknown>[] = []) {
  return {
    findByID: vi.fn(async () => ({
      id: 1,
      adminUserId: 'admin-1',
      displayName: 'draft.md',
      file: { id: 9, originalFilename: 'draft.md', mimeType: 'text/markdown', byteSize: 12, status: 'ready' },
    })),
    find: vi.fn(async () => ({ docs: chunks })),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
}

describe('admin AI file context service', () => {
  it('loads indexed attachment text into provider context', async () => {
    const payload = createPayload([{ id: 1, file: 9, chunkIndex: 0, content: '# Draft' }])

    const result = await loadAdminAiAttachmentContext({
      payload,
      adminUser: { id: 'admin-1' },
      attachmentIds: ['1'],
    })

    expect(result.contextMessage).toContain('Attachment: draft.md')
    expect(result.contextMessage).toContain('# Draft')
    expect(result.attachments[0]).toMatchObject({ referenceId: '1', filename: 'draft.md' })
  })

  it('rejects attachments that have no indexed text chunks', async () => {
    const payload = createPayload([])

    await expect(loadAdminAiAttachmentContext({
      payload,
      adminUser: { id: 'admin-1' },
      attachmentIds: ['1'],
    })).rejects.toThrow('AI file attachment has no indexed text')
  })
})
