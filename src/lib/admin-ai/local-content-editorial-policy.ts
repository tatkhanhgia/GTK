import type { SourceLedgerEntry } from './tools/source-ledger-utils'
import { slugify } from './tools/post-tool-content-utils'
import { buildDraftParagraphs, buildStructuredContentPack } from './local-content-structured-draft-builder'

export type BlogCategory = {
  id?: string | number
  slug?: string
  name?: string | { vi?: string; en?: string }
  description?: string | { vi?: string; en?: string }
}

export type DraftPlan = {
  title: string
  excerpt: string
  contentParagraphs: string[]
  contentPack?: {
    blocks: Array<Record<string, unknown>>
  }
  readingGoalLabel?: string
}

export type PayloadWorkflowReadClient = {
  find?: (args: { collection: string; [key: string]: unknown }) => Promise<{ docs?: unknown[] }>
}

export async function readBlogCategories(payload: PayloadWorkflowReadClient): Promise<BlogCategory[]> {
  if (!payload.find) return []
  const result = await payload.find({
    collection: 'categories',
    limit: 50,
    depth: 0,
    sort: 'slug',
    where: { type: { equals: 'blog' } },
  })
  return (result.docs ?? []).map((doc) => doc as BlogCategory)
}

export function isLocalContentPrompt(prompt: string) {
  return /blog|post|article|bai|draft|write|research|nghien cuu|tim hieu|publish|dang|schedule|lich|xep lich/i.test(prompt)
}

export function wantsLongFormDraft(prompt: string) {
  return /\b(5\s*[-–]\s*7\s*phut\s*doc|5\s*den\s*7\s*phut\s*doc|bai\s*dai|chi\s*tiet|deep\s*dive|long\s*form|long-form)\b/i.test(prompt)
}

export function extractResearchQuery(prompt: string) {
  const normalized = prompt.trim()
  const match = normalized.match(/(?:research|nghien cuu|tim hieu)\s*(?:ve|about)?\s*(.+?)(?:\s+(?:sau do|roi|de|va)\b|$)/i)
  const raw = (match?.[1] ?? normalized)
    .replace(/^(model|chu de)\s+/i, '')
    .replace(/\b(bai post\/blog|bai post|blog|post)\b.*$/i, '')
    .replace(/\b(tao|viet|soan)\s+(cho\s+toi|giup\s+toi|giup\s+minh)\b.*$/i, '')
    .replace(/\b(mat|muc)\s+khoang\s+\d+\s*[-–]\s*\d+\s+phut\s+doc\b.*$/i, '')
    .replace(/\b(khoang\s+\d+\s*[-–]\s*\d+\s+phut\s+doc|doc\s+\d+\s*[-–]\s*\d+\s+phut)\b.*$/i, '')
    .trim()
    .slice(0, 120)

  if (/\bharness\b/i.test(normalized)) return 'Harness'
  return raw
}

export function pickTopic(prompt: string, sources: SourceLedgerEntry[]) {
  const sourceTitle = sources[0]?.title ?? ''
  const topicFromSource = sourceTitle.match(/gemma[\s-]*4/i)?.[0]
  const topicFromPrompt = prompt.match(/gemma[\s-]*4/i)?.[0]
  return topicFromPrompt || topicFromSource || extractResearchQuery(prompt) || 'chủ đề bạn yêu cầu'
}

export function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/[^a-z0-9\s/-]+/gi, ' ')
    .toLowerCase()
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))]
}

function titleCaseTag(value: string) {
  const cleaned = value.trim().replace(/\s+/g, ' ')
  if (!cleaned) return ''

  const preferredTags: Record<string, string> = {
    devops: 'DevOps',
    gitops: 'GitOps',
    'ci/cd': 'CI/CD',
    ai: 'AI',
    llm: 'LLM',
  }
  const preferred = preferredTags[normalizeText(cleaned)]
  if (preferred) return preferred
  if (/^[A-Z0-9][A-Z0-9/+.-]*$/.test(cleaned)) return cleaned

  return cleaned
    .split(' ')
    .map((word) => {
      if (/^[A-Z0-9][A-Z0-9/+.-]*$/.test(word)) return word
      if (word.length <= 3 && /^[a-z]+$/i.test(word)) return word.toUpperCase()
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}

function formatDisplayTopic(topic: string) {
  const preferredTokens: Record<string, string> = {
    ai: 'AI',
    llm: 'LLM',
    api: 'API',
    devops: 'DevOps',
    gitops: 'GitOps',
    ci: 'CI',
    cd: 'CD',
    idp: 'IDP',
    openai: 'OpenAI',
  }

  return topic
    .trim()
    .split(/\s+/)
    .map((part) => {
      const normalized = normalizeText(part)
      if (preferredTokens[normalized]) return preferredTokens[normalized]
      if (/^[A-Z0-9/+.-]+$/.test(part)) return part
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    })
    .join(' ')
}

function isLikelyNoiseTag(value: string) {
  const normalized = normalizeText(value)
  if (!normalized) return true
  const blocked = ['title', 'text', 'press', 'blog', 'product update', 'q1 2026', 'q2 2026', 'q3 2026', 'q4 2026', '2026', '2025']
  return blocked.some((token) => normalized === token || normalized.startsWith(`${token} `))
}

function categorySearchText(category: BlogCategory) {
  const name = typeof category.name === 'string'
    ? category.name
    : typeof category.name === 'object'
      ? `${category.name.vi ?? ''} ${category.name.en ?? ''}`
      : ''
  const description = typeof category.description === 'string'
    ? category.description
    : typeof category.description === 'object'
      ? `${category.description.vi ?? ''} ${category.description.en ?? ''}`
      : ''
  return normalizeText([category.slug ?? '', name, description].join(' '))
}

function getCategoryKeywordScore(category: BlogCategory, text: string) {
  const categoryText = categorySearchText(category)
  const normalized = normalizeText(text)
  const slug = category.slug ?? ''
  const keywordMap: Record<string, string[]> = {
    'ai-news': ['ai', 'llm', 'model', 'gemma', 'openai', 'deepmind', 'research', 'prompt', 'agent'],
    tech: ['nextjs', 'react', 'payload', 'typescript', 'javascript', 'framework', 'review'],
    tutorials: ['tutorial', 'guide', 'how to', 'huong dan', 'setup', 'implement', 'step by step'],
    opinions: ['opinion', 'quan diem', 'should', 'thoughts', 'perspective', 'why'],
    automation: ['automation', 'agent', 'workflow', 'orchestration', 'pipeline', 'process', 'ai agent'],
    devops: ['devops', 'harness', 'cicd', 'ci/cd', 'gitops', 'deploy', 'release', 'infrastructure', 'pipeline'],
  }

  const haystacks = `${normalized} ${categoryText}`
  let score = 0
  for (const keyword of keywordMap[slug] ?? []) {
    if (haystacks.includes(normalizeText(keyword))) score += 3
  }
  for (const token of categoryText.split(/\s+/).filter(Boolean)) {
    if (normalized.includes(token)) score += 1
  }
  return score
}

export function inferCategorySlug(prompt: string, topic: string, sources: SourceLedgerEntry[], categories: BlogCategory[]) {
  const searchableText = [prompt, topic, ...sources.map((source) => `${source.title} ${source.summary} ${source.url ?? ''}`)].join(' ')
  const ranked = categories
    .map((category) => ({ category, score: getCategoryKeywordScore(category, searchableText) }))
    .sort((left, right) => right.score - left.score)

  const fallback = ranked.find((item) => item.category.slug === 'tech' || item.category.slug === 'ai-news')?.category.slug
  return ranked[0]?.score ? ranked[0].category.slug : fallback ?? categories[0]?.slug
}

async function slugExists(payload: PayloadWorkflowReadClient, candidate: string) {
  if (!payload.find) return false
  const result = await payload.find({
    collection: 'posts',
    locale: 'vi',
    limit: 1,
    depth: 0,
    draft: true,
    where: { slug: { equals: candidate } },
  })
  return (result.docs ?? []).length > 0
}

export async function resolveUniquePostSlug(payload: PayloadWorkflowReadClient, topic: string, prompt: string) {
  const baseSlug = slugify(topic) || 'bai-viet-moi'
  const preferredSlug = wantsLongFormDraft(prompt) ? `${baseSlug}-guide` : baseSlug
  const initialCandidate = preferredSlug.slice(0, 90)
  if (!await slugExists(payload, initialCandidate)) return initialCandidate

  for (let counter = 2; counter <= 25; counter += 1) {
    const suffix = `-${counter}`
    const candidate = `${initialCandidate.slice(0, 90 - suffix.length)}${suffix}`
    if (!await slugExists(payload, candidate)) return candidate
  }

  return `${baseSlug.slice(0, 80)}-${Date.now().toString(36)}`.slice(0, 90)
}

export function inferTags(topic: string, categorySlug: string | undefined, sources: SourceLedgerEntry[]) {
  const sourceText = sources.map((source) => `${source.title} ${source.summary}`).join(' ')
  const normalizedSourceText = normalizeText(sourceText)
  const pieces: string[] = [topic]
  const tagKeywordsByCategory: Record<string, string[]> = {
    'ai-news': ['AI', 'LLM', 'Gemma 4', 'Google DeepMind', 'Model Research', 'Local Model'],
    tech: ['Next.js', 'Payload CMS', 'TypeScript', 'React', 'Web Development'],
    tutorials: ['Tutorial', 'Guide', 'Step-by-step', 'Implementation'],
    opinions: ['Opinion', 'Analysis', 'Perspective'],
    automation: ['AI Agent', 'Workflow', 'Automation', 'Orchestration'],
    devops: ['DevOps', 'CI/CD', 'GitOps', 'Continuous Delivery', 'Pipeline'],
  }
  const sourceDrivenTags: Array<{ keyword: string; match: string }> = [
    { keyword: 'harness', match: 'Harness' },
    { keyword: 'gitops', match: 'GitOps' },
    { keyword: 'continuous delivery', match: 'Continuous Delivery' },
    { keyword: 'software delivery', match: 'Software Delivery' },
    { keyword: 'platform engineering', match: 'Platform Engineering' },
    { keyword: 'developer experience', match: 'Developer Experience' },
    { keyword: 'openai responses api', match: 'OpenAI Responses API' },
    { keyword: 'agentic workflow', match: 'Agent Workflow' },
    { keyword: 'workflow', match: 'Workflow' },
  ]

  pieces.push(...(tagKeywordsByCategory[categorySlug ?? ''] ?? []))
  for (const candidate of sourceDrivenTags) {
    if (normalizedSourceText.includes(normalizeText(candidate.keyword))) pieces.push(candidate.match)
  }

  return uniqueStrings(pieces.map(titleCaseTag).filter((value) => !isLikelyNoiseTag(value))).slice(0, 8)
}

function buildShortFormTitle(topic: string) {
  return `${formatDisplayTopic(topic)}: những điểm cần biết trước khi áp dụng`
}

function buildLongFormTitle(topic: string, categorySlug: string | undefined) {
  const displayTopic = formatDisplayTopic(topic)
  if (categorySlug === 'devops') return `${displayTopic} cho team kỹ thuật: khi nào nên dùng và đánh giá ra sao`
  if (categorySlug === 'automation') return `${displayTopic} trong workflow thực tế: cách đánh giá trước khi áp dụng`
  if (categorySlug === 'ai-news') return `${displayTopic}: điều gì đang đáng chú ý và tác động thực tế`
  return `${displayTopic}: hướng dẫn thực dụng cho team kỹ thuật`
}

export function buildDraftPlan(topic: string, prompt: string, sources: SourceLedgerEntry[], categorySlug: string | undefined): DraftPlan {
  const longForm = wantsLongFormDraft(prompt)
  if (longForm) {
    return {
      title: buildLongFormTitle(topic, categorySlug),
      excerpt: `Bản nháp này tổng hợp ${topic} theo góc nhìn thực dụng: bối cảnh áp dụng, trade-off, và cách team kỹ thuật nên đánh giá trước khi đưa vào workflow thực tế.`,
      contentParagraphs: buildDraftParagraphs(topic, sources, true),
      contentPack: buildStructuredContentPack(topic, sources, categorySlug),
      readingGoalLabel: 'Bản nháp dài hơn, hướng đến 5-7 phút đọc',
    }
  }

  return {
    title: buildShortFormTitle(topic),
    excerpt: `Tóm tắt nhanh về ${topic}, giá trị thực dụng, và những điều nên kiểm tra trước khi đưa vào công việc thực tế.`,
    contentParagraphs: buildDraftParagraphs(topic, sources, false),
  }
}

export function buildAssistantContent(
  topic: string,
  sources: SourceLedgerEntry[],
  categorySlug: string | undefined,
  tags: string[],
  draftPlan: DraftPlan,
  slug: string,
  pendingActionId?: string,
) {
  const sourceLines = sources.map((source, index) => {
    const title = source.url ? `${source.title} (${source.url})` : source.title
    return `${index + 1}. ${title}: ${source.summary}`
  })

  return [
    `Mình đã research xong cho chủ đề "${topic}".`,
    '',
    'Bản nháp đề xuất:',
    `- Tiêu đề: ${draftPlan.title}`,
    `- Slug dự kiến: ${slug}`,
    `- Danh mục: ${categorySlug ?? 'chưa xác định'}`,
    `- Tags: ${tags.length ? tags.join(', ') : 'chưa có'}`,
    `- Dàn ý: giới thiệu -> điểm đáng chú ý -> hạn chế -> khuyến nghị thực tế.${draftPlan.readingGoalLabel ? ` ${draftPlan.readingGoalLabel}.` : ''}`,
    draftPlan.contentPack ? '- Cấu trúc: draft sẽ có heading và section rõ ràng ngay từ lúc tạo.' : '',
    '',
    'Nguồn research:',
    ...(sourceLines.length ? sourceLines : ['- Chưa lấy được nguồn đủ tốt, cần bổ sung query hoặc URL.']),
    '',
    pendingActionId
      ? `Mình đã tạo yêu cầu chờ xác nhận để tạo draft bài viết. Xác nhận action ${pendingActionId} để tạo CMS draft, rồi sau đó có thể publish.`
      : 'Mình chưa tạo action nào vì chưa có nguồn phù hợp.',
  ].filter(Boolean).join('\n')
}
