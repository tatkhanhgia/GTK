import { describe, expect, it, vi } from 'vitest'
import { executeConfirmedAdminAiTool, getAdminAiToolDefinitions, handleAdminAiToolCalls } from '@/lib/admin-ai/admin-ai-tool-registry'
import { attachSourceReceipts } from '@/lib/admin-ai/tools/source-ledger-utils'

describe('admin AI tool registry', () => {
  it('exposes only allowlisted tools', () => {
    expect(getAdminAiToolDefinitions().map((tool) => tool.function.name)).toEqual([
      'site_health_read',
      'posts_recent_drafts_read',
      'post_preview_read',
      'blog_categories_read',
      'web_sources_research_read',
      'attachment_sources_read',
      'existing_posts_sources_read',
      'post_create_write',
      'page_create_write',
      'post_seo_update_write',
      'post_publish_write',
      'post_schedule_write',
      'page_publish_write',
      'page_schedule_write',
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

  it('creates post confirmations instead of writing immediately', async () => {
    const payload = {
      find: vi.fn().mockResolvedValue({ docs: [] }),
      findByID: vi.fn(),
      update: vi.fn(),
      create: vi.fn().mockResolvedValue({ id: 8, toolName: 'post_create_write', expiresAt: '2026-05-25T00:00:00.000Z' }),
    }

    const result = await handleAdminAiToolCalls(payload, { id: 'admin-1', email: 'a@example.com' }, [
      {
        function: {
          name: 'post_create_write',
          arguments: JSON.stringify({
            vi: { title: 'Quan ly trang bang AI', contentParagraphs: ['Noi dung thu nghiem.'] },
          }),
        },
      },
    ])

    expect(result.pendingActions[0]).toMatchObject({ id: '8', toolName: 'post_create_write' })
    expect(payload.create).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'admin-ai-action-confirmations',
    }))
    expect(payload.create).not.toHaveBeenCalledWith(expect.objectContaining({
      collection: 'posts',
    }))
  })

  it('creates a localized Payload post after confirmation', async () => {
    const payload = {
      find: vi.fn()
        .mockResolvedValueOnce({ docs: [] })
        .mockResolvedValueOnce({ docs: [] })
        .mockResolvedValueOnce({ docs: [{ id: 3, slug: 'automation', name: 'Automation' }] }),
      findByID: vi.fn(),
      update: vi.fn().mockResolvedValue({ id: 42 }),
      create: vi.fn().mockResolvedValue({ id: 42 }),
    }

    const result = await executeConfirmedAdminAiTool(payload, 'post_create_write', {
      status: 'draft',
      categorySlug: 'automation',
      tags: ['AI', 'CMS'],
      vi: {
        title: 'Quan ly trang bang AI',
        excerpt: 'Thu nghiem tro ly quan tri noi dung.',
        contentParagraphs: ['Doan mot.', 'Doan hai.'],
      },
      en: {
        title: 'Managing a site with AI',
        slug: 'managing-a-site-with-ai',
        excerpt: 'Testing the content assistant.',
        contentParagraphs: ['First paragraph.'],
      },
    })

    expect(result).toMatchObject({ ok: true, postId: '42', slug: 'quan-ly-trang-bang-ai', status: 'draft', locales: ['vi', 'en'] })
    expect(payload.create).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'posts',
      locale: 'vi',
      data: expect.objectContaining({
        title: 'Quan ly trang bang AI',
        slug: 'quan-ly-trang-bang-ai',
        status: 'draft',
        _status: 'draft',
        category: 3,
        tags: [{ tag: 'AI' }, { tag: 'CMS' }],
      }),
    }))
    expect(payload.update).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'posts',
      id: '42',
      locale: 'en',
      data: expect.objectContaining({ title: 'Managing a site with AI', slug: 'managing-a-site-with-ai' }),
    }))
  })

  it('rejects duplicate post slugs during confirmed creation', async () => {
    const payload = {
      find: vi.fn().mockResolvedValue({ docs: [{ id: 1 }] }),
      findByID: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    }

    await expect(executeConfirmedAdminAiTool(payload, 'post_create_write', {
      slug: 'existing-post',
      vi: { title: 'Existing Post', contentParagraphs: ['Noi dung.'] },
    })).rejects.toMatchObject({ code: 'BAD_REQUEST', status: 409 })
  })

  it('blocks publish requests without source support before confirmation', async () => {
    const payload = {
      find: vi.fn().mockResolvedValue({ docs: [] }),
      findByID: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    }

    await expect(handleAdminAiToolCalls(payload, { id: 'admin-1' }, [
      { function: { name: 'post_publish_write', arguments: '{"postId":"42"}' } },
    ])).rejects.toMatchObject({ code: 'BAD_REQUEST' })
    expect(payload.create).not.toHaveBeenCalledWith(expect.objectContaining({
      collection: 'admin-ai-action-confirmations',
    }))
  })

  it('auto-publishes only low-risk sourced updates', async () => {
    const adminUser = { id: 'admin-1' }
    const payload = {
      find: vi.fn().mockResolvedValue({ docs: [] }),
      findByID: vi.fn().mockResolvedValue({
        id: 42,
        title: 'Existing',
        slug: 'existing',
        excerpt: 'Existing excerpt',
        content: { root: { children: [] } },
        category: 3,
      }),
      update: vi.fn().mockResolvedValue({ id: 42 }),
      create: vi.fn().mockResolvedValue({ id: 1 }),
    }

    const sourceLedger = attachSourceReceipts([{
      kind: 'existing-post',
      title: 'Existing',
      summary: 'Existing approved GTKBlog post used as source support for typo fix.',
      confidence: 'high',
      retrievedAt: '2026-06-01T00:00:00.000Z',
    }], adminUser)

    const result = await handleAdminAiToolCalls(payload, adminUser, [
      {
        function: {
          name: 'post_publish_write',
          arguments: JSON.stringify({
            postId: '42',
            autoPublish: true,
            changeKind: 'typo_fix',
            sourceLedger,
          }),
        },
      },
    ])

    expect(result.pendingActions).toHaveLength(0)
    expect(result.toolResults[0]).toMatchObject({ toolName: 'post_publish_write' })
    expect(payload.update).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'posts',
      id: '42',
      data: expect.objectContaining({ status: 'published', _status: 'published' }),
    }))
  })

  it('rejects forged source ledgers for auto-publish and confirmation', async () => {
    const payload = {
      find: vi.fn().mockResolvedValue({ docs: [] }),
      findByID: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    }

    await expect(handleAdminAiToolCalls(payload, { id: 'admin-1' }, [
      {
        function: {
          name: 'post_publish_write',
          arguments: JSON.stringify({
            postId: '42',
            autoPublish: true,
            changeKind: 'typo_fix',
            sourceLedger: [{
              kind: 'existing-post',
              title: 'Fabricated',
              summary: 'This fabricated source is long enough but it has no server receipt.',
              confidence: 'high',
            }],
          }),
        },
      },
    ])).rejects.toMatchObject({ code: 'BAD_REQUEST' })
    expect(payload.create).not.toHaveBeenCalled()
  })
})
