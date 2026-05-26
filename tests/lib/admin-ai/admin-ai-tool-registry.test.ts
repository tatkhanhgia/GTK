import { describe, expect, it, vi } from 'vitest'
import { getAdminAiToolDefinitions, handleAdminAiToolCalls } from '@/lib/admin-ai/admin-ai-tool-registry'

describe('admin AI tool registry', () => {
  it('exposes only allowlisted tools', () => {
    expect(getAdminAiToolDefinitions().map((tool) => tool.function.name)).toEqual([
      'site_health_read',
      'posts_recent_drafts_read',
      'post_seo_update_write',
    ])
  })

  it('executes read tools and creates confirmations for write tools', async () => {
    const payload = {
      find: vi.fn().mockResolvedValue({ docs: [] }),
      findByID: vi.fn(),
      update: vi.fn(),
      create: vi.fn().mockResolvedValue({ id: 7, toolName: 'post_seo_update_write', expiresAt: '2026-05-25T00:00:00.000Z' }),
    }

    const result = await handleAdminAiToolCalls(payload, { id: 'admin-1', email: 'a@example.com' }, [
      { function: { name: 'posts_recent_drafts_read', arguments: '{"limit":2}' } },
      { function: { name: 'post_seo_update_write', arguments: '{"postId":"1","excerpt":"New"}' } },
    ])

    expect(result.toolResults[0].toolName).toBe('posts_recent_drafts_read')
    expect(result.pendingActions[0]).toMatchObject({ id: '7', toolName: 'post_seo_update_write' })
    expect(payload.create).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'admin-ai-action-confirmations',
    }))
  })
})
