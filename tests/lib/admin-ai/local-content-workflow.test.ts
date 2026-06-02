import { beforeEach, describe, expect, it, vi } from 'vitest'

const workflowMocks = vi.hoisted(() => ({
  researchWebSources: vi.fn(),
  createAdminAiActionConfirmation: vi.fn(),
}))

vi.mock('@/lib/admin-ai/tools/content-research-tools', () => ({
  researchWebSources: workflowMocks.researchWebSources,
}))

vi.mock('@/lib/admin-ai/admin-ai-confirmation-service', () => ({
  createAdminAiActionConfirmation: workflowMocks.createAdminAiActionConfirmation,
}))

describe('local content workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    workflowMocks.researchWebSources.mockResolvedValue([
      {
        kind: 'web',
        title: 'Gemma 4 - Google DeepMind',
        url: 'https://deepmind.google/models/gemma/gemma-4/',
        summary: 'Perceive, reason, use tools and interact.',
        confidence: 'high',
        retrievedAt: '2026-06-01T00:00:00.000Z',
        receipt: 'admin-ai-src:v1:test',
      },
    ])
    workflowMocks.createAdminAiActionConfirmation.mockResolvedValue({
      id: '12',
      toolName: 'post_create_write',
      summary: 'Confirm',
      expiresAt: '2026-06-01T01:00:00.000Z',
    })
  })

  it('creates a pending post draft confirmation from research sources', async () => {
    const { runLocalContentWorkflow } = await import('@/lib/admin-ai/local-content-workflow')
    const payload = {
      find: vi.fn().mockImplementation(async (args: { collection: string; where?: { slug?: { equals?: string } } }) => {
        if (args.collection === 'categories') {
          return {
            docs: [
              { slug: 'ai-news', name: { vi: 'Tin tuc AI', en: 'AI News' }, description: { en: 'Latest AI news' } },
              { slug: 'devops', name: { vi: 'DevOps', en: 'DevOps' }, description: { en: 'Deployment and operations' } },
              { slug: 'tech', name: { vi: 'Cong nghe', en: 'Technology' }, description: { en: 'Tech trends' } },
            ],
          }
        }

        if (args.collection === 'posts') {
          return { docs: [] }
        }

        return { docs: [] }
      }),
      create: vi.fn(),
    }

    const result = await runLocalContentWorkflow(
      payload,
      { id: 'admin-1', email: 'admin@example.com' },
      'Research ve model gemma 4 sau do tao bai post/blog ve no',
    )

    expect(result.handled).toBe(true)
    expect(payload.find).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'categories',
    }))
    expect(workflowMocks.researchWebSources).toHaveBeenCalledWith(expect.objectContaining({
      query: expect.stringContaining('gemma 4'),
    }), expect.objectContaining({ id: 'admin-1' }))
    expect(workflowMocks.createAdminAiActionConfirmation).toHaveBeenCalledWith(
      payload,
      expect.objectContaining({ id: 'admin-1' }),
      'post_create_write',
      expect.objectContaining({
        slug: 'gemma-4',
        categorySlug: 'ai-news',
        tags: expect.arrayContaining(['Gemma 4', 'AI']),
        sourceLedger: expect.any(Array),
        vi: expect.objectContaining({
          title: 'Gemma 4: những điểm cần biết trước khi áp dụng',
        }),
      }),
      expect.stringContaining('Gemma 4:'),
    )
    expect(result.pendingActions[0]).toMatchObject({ id: '12', toolName: 'post_create_write' })
    expect(result.assistantContent).toContain('Gemma 4')
    expect(result.assistantContent).toContain('Danh mục')
    expect(result.assistantContent).toContain('Tags')
  })

  it('creates a unique slug and longer draft when the prompt asks for 5-7 minute reading time', async () => {
    workflowMocks.researchWebSources.mockResolvedValue([
      {
        kind: 'web',
        title: 'Q1 2026 Product Update: Harness Pipeline',
        url: 'https://www.harness.io/blog/q1-2026-product-update-harness-pipeline',
        summary: 'Harness expanded pipeline coordination, approval flows, and delivery visibility for larger engineering teams.',
        confidence: 'high',
        retrievedAt: '2026-06-03T00:00:00.000Z',
        receipt: 'admin-ai-src:v1:harness',
      },
    ])

    const payload = {
      find: vi.fn().mockImplementation(async (args: { collection: string; where?: { slug?: { equals?: string } } }) => {
        if (args.collection === 'categories') {
          return {
            docs: [
              { slug: 'devops', name: { vi: 'DevOps', en: 'DevOps' }, description: { en: 'Deployment and operations' } },
              { slug: 'tech', name: { vi: 'Cong nghe', en: 'Technology' }, description: { en: 'Tech trends' } },
            ],
          }
        }

        if (args.collection === 'posts' && args.where?.slug?.equals === 'harness') {
          return { docs: [{ id: 'existing-harness' }] }
        }

        if (args.collection === 'posts' && args.where?.slug?.equals === 'harness-guide') {
          return { docs: [] }
        }

        return { docs: [] }
      }),
      create: vi.fn(),
    }

    const { runLocalContentWorkflow } = await import('@/lib/admin-ai/local-content-workflow')
    const result = await runLocalContentWorkflow(
      payload,
      { id: 'admin-1', email: 'admin@example.com' },
      'Hay tim hieu ve Harness va tao cho toi mot bai blog/post mat khoang 5-7 phut doc',
    )

    expect(workflowMocks.createAdminAiActionConfirmation).toHaveBeenCalledWith(
      payload,
      expect.objectContaining({ id: 'admin-1' }),
      'post_create_write',
      expect.objectContaining({
        slug: 'harness-guide',
        categorySlug: 'devops',
        tags: expect.arrayContaining(['Harness', 'DevOps', 'CI/CD', 'GitOps', 'Continuous Delivery']),
        vi: expect.objectContaining({
          title: 'Harness cho team kỹ thuật: khi nào nên dùng và đánh giá ra sao',
          contentPack: expect.objectContaining({
            blocks: expect.any(Array),
          }),
        }),
      }),
      expect.stringContaining('Harness cho team kỹ thuật:'),
    )
    const draftInput = workflowMocks.createAdminAiActionConfirmation.mock.calls[0]?.[3] as {
      vi: { contentParagraphs: string[]; contentPack?: { blocks: Array<Record<string, unknown>> } }
    }
    expect(draftInput.vi.contentParagraphs.length).toBeGreaterThanOrEqual(8)
    expect(draftInput.vi.contentPack?.blocks.length).toBeGreaterThanOrEqual(6)
    expect(result.assistantContent).toContain('Slug dự kiến: harness-guide')
    expect(result.assistantContent).toContain('5-7 phút đọc')
    expect(result.assistantContent).toContain('heading')
  })
})
