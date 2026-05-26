import { describe, expect, it, vi } from 'vitest'
import { confirmAdminAiAction } from '@/lib/admin-ai/admin-ai-confirmation-service'

describe('admin AI confirmation service', () => {
  it('executes a pending write action once for the owning admin', async () => {
    const confirmation = {
      id: '1',
      toolName: 'post_seo_update_write',
      status: 'pending',
      adminUserId: 'admin-1',
      input: { postId: '42', excerpt: 'Better excerpt' },
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    }
    const payload = {
      find: vi.fn(),
      findByID: vi.fn().mockResolvedValue(confirmation),
      create: vi.fn(),
      update: vi.fn((args) => {
        if (args.collection === 'admin-ai-action-confirmations' && args.where) {
          return Promise.resolve({ docs: [confirmation] })
        }
        return Promise.resolve({})
      }),
    }

    const result = await confirmAdminAiAction(payload, { id: 'admin-1' }, '1')

    expect(result).toMatchObject({ ok: true, postId: '42' })
    expect(payload.update).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'posts',
      id: '42',
    }))
    expect(payload.update).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'admin-ai-action-confirmations',
      where: expect.any(Object),
      data: { status: 'executing' },
    }))
    expect(payload.update).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'admin-ai-action-confirmations',
      data: expect.objectContaining({ status: 'executed' }),
    }))
  })

  it('rejects confirmations owned by a different admin', async () => {
    const payload = {
      find: vi.fn(),
      findByID: vi.fn().mockResolvedValue({
        toolName: 'post_seo_update_write',
        status: 'pending',
        adminUserId: 'admin-1',
        input: { postId: '42' },
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
      }),
      create: vi.fn(),
      update: vi.fn(),
    }

    await expect(confirmAdminAiAction(payload, { id: 'admin-2' }, '1')).rejects.toThrow('another admin')
  })

  it('rejects a confirmation that was claimed by another request', async () => {
    const payload = {
      find: vi.fn(),
      findByID: vi.fn().mockResolvedValue({
        toolName: 'post_seo_update_write',
        status: 'pending',
        adminUserId: 'admin-1',
        input: { postId: '42' },
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
      }),
      create: vi.fn(),
      update: vi.fn().mockResolvedValue({ docs: [] }),
    }

    await expect(confirmAdminAiAction(payload, { id: 'admin-1' }, '1')).rejects.toThrow('already executing')
  })
})
