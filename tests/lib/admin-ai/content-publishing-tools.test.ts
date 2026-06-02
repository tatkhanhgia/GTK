import { describe, expect, it, vi } from 'vitest'
import { publishPost } from '@/lib/admin-ai/tools/content-publishing-tools'
import { attachSourceReceipts } from '@/lib/admin-ai/tools/source-ledger-utils'

describe('content publishing tools', () => {
  it('rejects schedules in the past', async () => {
    const payload = {
      find: vi.fn(),
      findByID: vi.fn().mockResolvedValue({
        title: 'Post',
        slug: 'post',
        excerpt: 'Excerpt',
        content: { root: { children: [] } },
        category: 1,
      }),
      create: vi.fn(),
      update: vi.fn(),
    }

    const sourceLedger = attachSourceReceipts([{
      kind: 'existing-post',
      title: 'Source',
      retrievedAt: '2026-06-01T00:00:00.000Z',
      summary: 'Approved source content with enough detail for a narrow update.',
      confidence: 'high',
    }], { id: 'admin-1' })

    await expect(publishPost(payload, {
      postId: '1',
      scheduledFor: '2020-01-01T00:00:00.000Z',
      sourceLedger,
    }, true, { id: 'admin-1' })).rejects.toMatchObject({ code: 'BAD_REQUEST' })
    expect(payload.update).not.toHaveBeenCalled()
  })
})

