import { AdminAiError } from '../admin-ai-chat-contract'
import {
  asRecord,
  createRichText,
  getLocalizedText,
  getOptionalText,
  getPostId,
  getTagRows,
  getText,
  parseLocalePostInput,
} from './post-tool-content-utils'
import { createRichTextFromContentPack } from './lexical-content-builder'
import { evaluatePublishingPolicy } from '../publishing-policy'

type PayloadPostClient = {
  find: (args: { collection: string; [key: string]: unknown }) => Promise<{ docs?: unknown[] }>
  create: (args: { collection: string; data: Record<string, unknown>; [key: string]: unknown }) => Promise<unknown>
  update: (args: { collection: string; id: string; data: Record<string, unknown>; [key: string]: unknown }) => Promise<unknown>
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\u0111/g, 'd')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90)
}

async function findBlogCategoryId(payload: PayloadPostClient, categorySlug: unknown) {
  const slug = getOptionalText(categorySlug, 90)
  if (!slug) return undefined

  const result = await payload.find({
    collection: 'categories',
    limit: 1,
    depth: 0,
    where: {
      and: [
        { slug: { equals: slug } },
        { type: { equals: 'blog' } },
      ],
    },
  })
  const category = result.docs?.[0]
  const id = asRecord(category).id
  if (typeof id !== 'string' && typeof id !== 'number') {
    throw new AdminAiError('BAD_REQUEST', `Blog category not found: ${slug}`, 400)
  }
  return id
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

export async function readPostPreviewDetails(payload: PayloadPostClient, input: unknown) {
  const data = asRecord(input)
  const postId = typeof data.postId === 'string' || typeof data.postId === 'number' ? String(data.postId) : ''
  if (!postId) throw new AdminAiError('BAD_REQUEST', 'postId is required.', 400)

  const post = asRecord(await (payload as PayloadPostClient & {
    findByID: (args: { collection: string; id: string; [key: string]: unknown }) => Promise<unknown>
  }).findByID({ collection: 'posts', id: postId, depth: 1, draft: true }))
  const slug = getText(post.slug, 120)
  return {
    id: postId,
    title: getLocalizedText(post.title),
    slug,
    status: post.status ?? post._status ?? 'draft',
    previewUrl: slug ? `/vi/blog/${slug}?preview=1` : undefined,
  }
}

export async function readBlogCategories(payload: PayloadPostClient) {
  const result = await payload.find({
    collection: 'categories',
    limit: 50,
    depth: 0,
    sort: 'slug',
    where: { type: { equals: 'blog' } },
  })

  return (result.docs ?? []).map((doc) => {
    const category = asRecord(doc)
    return {
      id: category.id,
      slug: category.slug,
      name: getLocalizedText(category.name),
      description: getLocalizedText(category.description),
    }
  })
}

export async function createPostDraft(payload: PayloadPostClient, input: unknown) {
  const data = asRecord(input)
  const vi = parseLocalePostInput(data.vi, 'vi', true)
  if (!vi) throw new AdminAiError('BAD_REQUEST', 'vi post content is required.', 400)
  const en = parseLocalePostInput(data.en, 'en', false)
  const slug = slugify(getText(data.slug, 120) || vi.slug || vi.title)
  if (!slug) throw new AdminAiError('BAD_REQUEST', 'A valid slug or title is required.', 400)
  const enSlug = en?.slug ? slugify(en.slug) : undefined

  const existing = await payload.find({
    collection: 'posts',
    locale: 'vi',
    limit: 1,
    depth: 0,
    draft: true,
    where: { slug: { equals: slug } },
  })
  if ((existing.docs ?? []).length > 0) {
    throw new AdminAiError('BAD_REQUEST', `A post with slug "${slug}" already exists.`, 409)
  }
  if (enSlug && enSlug !== slug) {
    const existingEn = await payload.find({
      collection: 'posts',
      locale: 'en',
      limit: 1,
      depth: 0,
      draft: true,
      where: { slug: { equals: enSlug } },
    })
    if ((existingEn.docs ?? []).length > 0) {
      throw new AdminAiError('BAD_REQUEST', `An English post with slug "${enSlug}" already exists.`, 409)
    }
  }

  const policy = evaluatePublishingPolicy({
    contentType: 'post',
    action: 'create_draft',
    changeKind: 'new_long_form',
    sourceLedger: data.sourceLedger,
    text: [vi.title, vi.excerpt, ...vi.contentParagraphs].filter(Boolean).join(' '),
  })
  if (policy.decision === 'blocked') throw new AdminAiError('BAD_REQUEST', policy.reasons.join(' '), 400)

  const status = 'draft'
  const category = await findBlogCategoryId(payload, data.categorySlug)
  const tags = getTagRows(data.tags)
  const author = typeof data.authorId === 'string' || typeof data.authorId === 'number' ? data.authorId : undefined
  const viContent = asRecord(data.vi).contentPack
    ? createRichTextFromContentPack(asRecord(data.vi).contentPack)
    : createRichText(vi.contentParagraphs)

  const created = await payload.create({
    collection: 'posts',
    locale: 'vi',
    draft: true,
    data: {
      title: vi.title,
      slug,
      excerpt: vi.excerpt,
      content: viContent,
      status,
      _status: 'draft',
      ...(category !== undefined ? { category } : {}),
      ...(tags ? { tags } : {}),
      ...(author !== undefined ? { author } : {}),
    },
  })

  const id = getPostId(created)
  if (!id) throw new AdminAiError('TOOL_ERROR', 'Post was created without an id.', 500)

  if (en) {
    const enContent = asRecord(data.en).contentPack
      ? createRichTextFromContentPack(asRecord(data.en).contentPack)
      : createRichText(en.contentParagraphs)
    await payload.update({
      collection: 'posts',
      id,
      locale: 'en',
      draft: true,
      data: {
        title: en.title,
        ...(enSlug ? { slug: enSlug } : {}),
        excerpt: en.excerpt,
        content: enContent,
      },
    })
  }

  return {
    ok: true,
    postId: id,
    slug,
    status,
    locales: en ? ['vi', 'en'] : ['vi'],
    policy,
  }
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
