import { AdminAiError } from '../admin-ai-chat-contract'
import { evaluatePublishingPolicy, type PublishingPolicyResult } from '../publishing-policy'
import { asRecord, createRichText, getOptionalText, getPostId, getText, slugify } from './post-tool-content-utils'
import { createRichTextFromContentPack } from './lexical-content-builder'
import { verifySourceLedgerReceipts } from './source-ledger-utils'

type PayloadContentPublishClient = {
  find: (args: { collection: string; [key: string]: unknown }) => Promise<{ docs?: unknown[] }>
  findByID: (args: { collection: string; id: string; [key: string]: unknown }) => Promise<unknown>
  create: (args: { collection: string; data: Record<string, unknown>; [key: string]: unknown }) => Promise<unknown>
  update: (args: { collection: string; id: string; data: Record<string, unknown>; [key: string]: unknown }) => Promise<unknown>
}

type ToolOutcome = {
  ok: true
  policy: PublishingPolicyResult
  [key: string]: unknown
}

function requireId(input: unknown, name: string) {
  const value = asRecord(input)[name]
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new AdminAiError('BAD_REQUEST', `${name} is required.`, 400)
  }
  return String(value)
}

function publicationDate(input: unknown, requiredFuture: boolean) {
  const raw = getOptionalText(asRecord(input).publishedAt ?? asRecord(input).scheduledFor, 80)
  const date = raw ? new Date(raw) : new Date()
  if (Number.isNaN(date.getTime())) throw new AdminAiError('BAD_REQUEST', 'Publish date must be a valid ISO date.', 400)
  if (requiredFuture && date.getTime() <= Date.now()) {
    throw new AdminAiError('BAD_REQUEST', 'scheduledFor must be in the future.', 400)
  }
  return date.toISOString()
}

function textForPolicy(record: Record<string, unknown>) {
  return [
    record.title,
    record.slug,
    record.excerpt,
    record.seoTitle,
    record.seoDescription,
    JSON.stringify(record.sourceLedger ?? []),
  ].filter(Boolean).join(' ')
}

function ensureCanPublishPost(post: Record<string, unknown>) {
  const missing = ['title', 'slug', 'excerpt', 'content', 'category'].filter((key) => !post[key])
  if (missing.length > 0) throw new AdminAiError('BAD_REQUEST', `Post is missing publish fields: ${missing.join(', ')}.`, 400)
}

function ensureCanPublishPage(page: Record<string, unknown>) {
  const missing = ['title', 'slug', 'content'].filter((key) => !page[key])
  if (missing.length > 0) throw new AdminAiError('BAD_REQUEST', `Page is missing publish fields: ${missing.join(', ')}.`, 400)
}

export async function createPageDraft(payload: PayloadContentPublishClient, input: unknown): Promise<ToolOutcome> {
  const data = asRecord(input)
  const title = getText(data.title, 180)
  const slug = slugify(getText(data.slug, 120) || title)
  if (!title || !slug) throw new AdminAiError('BAD_REQUEST', 'title and slug are required.', 400)
  if (!data.contentPack && !getText(data.content, 8000)) {
    throw new AdminAiError('BAD_REQUEST', 'content or contentPack is required.', 400)
  }

  const existing = await payload.find({ collection: 'pages', limit: 1, depth: 0, where: { slug: { equals: slug } } })
  if ((existing.docs ?? []).length > 0) throw new AdminAiError('BAD_REQUEST', `A page with slug "${slug}" already exists.`, 409)

  const policy = evaluatePublishingPolicy({
    contentType: 'page',
    action: 'create_draft',
    changeKind: 'new_long_form',
    sourceLedger: data.sourceLedger,
    text: textForPolicy(data),
  })
  if (policy.decision === 'blocked') throw new AdminAiError('BAD_REQUEST', policy.reasons.join(' '), 400)

  const content = data.contentPack ? createRichTextFromContentPack(data.contentPack) : createRichText([getText(data.content, 8000)])
  const created = await payload.create({
    collection: 'pages',
    locale: getText(data.locale, 8) === 'en' ? 'en' : 'vi',
    data: {
      title,
      slug,
      content,
      status: 'draft',
      ...(getOptionalText(data.seoTitle, 180) ? { seoTitle: getOptionalText(data.seoTitle, 180) } : {}),
      ...(getOptionalText(data.seoDescription, 500) ? { seoDescription: getOptionalText(data.seoDescription, 500) } : {}),
    },
  })

  return { ok: true, pageId: getPostId(created), slug, status: 'draft', policy }
}

export async function publishPost(payload: PayloadContentPublishClient, input: unknown, schedule = false, adminUser?: unknown): Promise<ToolOutcome> {
  const id = requireId(input, 'postId')
  const post = asRecord(await payload.findByID({ collection: 'posts', id, depth: 1, draft: true }))
  ensureCanPublishPost(post)
  const publishedAt = publicationDate(input, schedule)
  const verifiedSourceLedger = verifySourceLedgerReceipts(asRecord(input).sourceLedger, adminUser)
  const policy = evaluatePublishingPolicy({
    contentType: 'post',
    action: schedule ? 'schedule' : 'publish',
    changeKind: asRecord(input).changeKind as never,
    requestedAutoPublish: asRecord(input).autoPublish === true,
    sourceLedger: asRecord(input).sourceLedger,
    verifiedSourceLedger,
    text: textForPolicy({ ...post, ...asRecord(input) }),
  })
  if (policy.decision === 'blocked') throw new AdminAiError('BAD_REQUEST', policy.reasons.join(' '), 400)

  await payload.update({
    collection: 'posts',
    id,
    draft: false,
    data: { status: 'published', _status: 'published', publishedAt },
  })
  return { ok: true, postId: id, status: schedule ? 'scheduled' : 'published', publishedAt, policy }
}

export async function publishPage(payload: PayloadContentPublishClient, input: unknown, schedule = false, adminUser?: unknown): Promise<ToolOutcome> {
  const id = requireId(input, 'pageId')
  const page = asRecord(await payload.findByID({ collection: 'pages', id, depth: 1, draft: true }))
  ensureCanPublishPage(page)
  const publishedAt = publicationDate(input, schedule)
  const verifiedSourceLedger = verifySourceLedgerReceipts(asRecord(input).sourceLedger, adminUser)
  const policy = evaluatePublishingPolicy({
    contentType: 'page',
    action: schedule ? 'schedule' : 'publish',
    changeKind: asRecord(input).changeKind as never,
    requestedAutoPublish: asRecord(input).autoPublish === true,
    sourceLedger: asRecord(input).sourceLedger,
    verifiedSourceLedger,
    text: textForPolicy({ ...page, ...asRecord(input) }),
  })
  if (policy.decision === 'blocked') throw new AdminAiError('BAD_REQUEST', policy.reasons.join(' '), 400)

  await payload.update({
    collection: 'pages',
    id,
    data: { status: 'published', publishedAt },
  })
  return { ok: true, pageId: id, status: schedule ? 'scheduled' : 'published', publishedAt, policy }
}
