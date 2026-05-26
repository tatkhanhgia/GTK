import { AdminAiError } from '../admin-ai-chat-contract'

type PayloadPostClient = {
  find: (args: { collection: string; [key: string]: unknown }) => Promise<{ docs?: unknown[] }>
  update: (args: { collection: string; id: string; data: Record<string, unknown>; [key: string]: unknown }) => Promise<unknown>
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {}
}

function getLocalizedText(value: unknown) {
  if (typeof value === 'string') return value
  const record = asRecord(value)
  return String(record.vi ?? record.en ?? '')
}

export async function readRecentDraftPosts(payload: PayloadPostClient, input: unknown) {
  const limitValue = Number(asRecord(input).limit ?? 5)
  const limit = Number.isFinite(limitValue) ? Math.min(Math.max(Math.floor(limitValue), 1), 10) : 5
  const result = await payload.find({
    collection: 'posts',
    limit,
    depth: 0,
    sort: '-updatedAt',
    where: { status: { equals: 'draft' } },
  })

  return (result.docs ?? []).map((doc) => {
    const post = asRecord(doc)
    return {
      id: post.id,
      title: getLocalizedText(post.title),
      slug: post.slug,
      excerpt: getLocalizedText(post.excerpt),
      updatedAt: post.updatedAt,
    }
  })
}

export async function updatePostSeoFields(payload: PayloadPostClient, input: unknown) {
  const data = asRecord(input)
  const postId = typeof data.postId === 'string' || typeof data.postId === 'number' ? String(data.postId) : ''
  if (!postId) throw new AdminAiError('BAD_REQUEST', 'postId is required.', 400)

  const updateData: Record<string, unknown> = {}
  if (typeof data.excerpt === 'string') updateData.excerpt = data.excerpt.slice(0, 500)
  if (Array.isArray(data.tags)) {
    updateData.tags = data.tags
      .filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
      .slice(0, 12)
      .map((tag) => ({ tag: tag.trim().slice(0, 64) }))
  }
  if (Object.keys(updateData).length === 0) {
    throw new AdminAiError('BAD_REQUEST', 'At least one SEO field is required.', 400)
  }

  const updated = await payload.update({ collection: 'posts', id: postId, data: updateData, depth: 0 })
  return { ok: true, postId, updated }
}
