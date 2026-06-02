import { AdminAiError } from '../admin-ai-chat-contract'
import { isIP } from 'net'
import { publishedNowWhere } from '@/lib/content/publication-state'
import { asRecord } from './post-tool-content-utils'
import { attachSourceReceipts, sanitizeSourceSummary, type SourceLedgerEntry } from './source-ledger-utils'

type PayloadResearchClient = {
  find: (args: { collection: string; [key: string]: unknown }) => Promise<{ docs?: unknown[] }>
  findByID: (args: { collection: string; id: string; [key: string]: unknown }) => Promise<unknown>
}

function getAdminId(user: unknown) {
  const id = asRecord(user).id
  return typeof id === 'string' || typeof id === 'number' ? String(id) : ''
}

function assertHttpUrl(value: unknown) {
  const url = typeof value === 'string' ? value.trim() : ''
  if (!/^https:\/\//i.test(url)) throw new AdminAiError('BAD_REQUEST', 'Research URLs must use public HTTPS.', 400)
  return url
}

function getText(value: string, maxLength: number) {
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

function assertPublicHttpsUrl(rawUrl: string) {
  const url = new URL(assertHttpUrl(rawUrl))
  if (url.username || url.password || isPrivateHostname(url.hostname) || isPrivateIpLiteral(url.hostname)) {
    throw new AdminAiError('BAD_REQUEST', 'Research URL host is not allowed.', 400)
  }
  return url.toString()
}

function isPrivateHostname(hostname: string) {
  return hostname === 'localhost' || hostname.endsWith('.localhost') || hostname === 'metadata.google.internal'
}

function isPrivateIpLiteral(hostname: string) {
  if (!isIP(hostname)) return false
  if (hostname === '::1' || hostname.startsWith('fe80:') || hostname.startsWith('fc') || hostname.startsWith('fd')) return true
  const parts = hostname.split('.').map(Number)
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part))) return false
  return (
    parts[0] === 10 ||
    parts[0] === 127 ||
    (parts[0] === 169 && parts[1] === 254) ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168) ||
    (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) ||
    parts[0] === 0
  )
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, code) => String.fromCodePoint(Number.parseInt(code, 16)))
}

function stripHtml(html: string) {
  return decodeHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
}

function buildSearchUrl(query: string) {
  return `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`
}

function buildResearchQuery(query: string) {
  const normalized = query.toLowerCase()
  if (/\bharness\b/.test(normalized)) {
    if (/latest|new|news|mới nhất|moi nhat|thông tin mới|thong tin moi/i.test(query)) {
      return 'site:harness.io/press-and-news Harness 2026 OR site:harness.io/blog Harness 2026'
    }
    return 'site:harness.io OR site:docs.harness.io Harness official'
  }
  return query
}

function getCuratedResearchUrls(query: string) {
  if (!/\bharness\b/i.test(query)) return []
  return [
    'https://www.harness.io/blog/q1-2026-product-update-harness-pipeline',
    'https://www.harness.io/blog/q1-2026-product-update-harness-continuous-delivery-gitops',
    'https://www.harness.io/press-and-news/wipro-and-harness-announce-collaboration-to-accelerate-ai-native-software-delivery',
    'https://www.harness.io/press-and-news/harness-announces-new-integrations-with-aws-to-connect-ai-software-development-with-intelligent-delivery',
    'https://developer.harness.io/docs/',
  ]
}

function unwrapSearchResultUrl(rawUrl: string) {
  try {
    const url = new URL(rawUrl, 'https://duckduckgo.com')
    const nested = url.searchParams.get('uddg')
    if (nested) return decodeURIComponent(nested)
    return url.toString()
  } catch {
    return rawUrl
  }
}

async function fetchText(url: string, timeoutMs = 12000) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) GTKBlog-Admin-AI/1.0',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    })
    if (!response.ok) return ''
    return await response.text()
  } catch {
    return ''
  } finally {
    clearTimeout(timeout)
  }
}

function extractPageSummary(html: string) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
  const metaDescription = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1]
  const metaOgDescription = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)?.[1]
  const paragraphs = stripHtml(html)
    .split(/\s{2,}/)
    .map((part) => getText(part, 240))
    .filter((part) => part.length >= 40)
    .slice(0, 3)

  return getText([
    title ? `Title: ${getText(decodeHtmlEntities(title), 180)}` : '',
    metaDescription ? `Description: ${getText(decodeHtmlEntities(metaDescription), 280)}` : '',
    metaOgDescription ? `Social description: ${getText(decodeHtmlEntities(metaOgDescription), 280)}` : '',
    paragraphs.length ? `Text: ${paragraphs.join(' | ')}` : '',
  ].filter(Boolean).join(' '), 900)
}

async function searchWeb(query: string) {
  const searchQuery = buildResearchQuery(query)
  const html = await fetchText(buildSearchUrl(searchQuery))
  if (!html) return []

  const blocks = html.split(/<a rel="nofollow" class="result__a"/i).slice(1, 8)
  const results = blocks.map((block) => {
    const href = block.match(/href="([^"]+)"/i)?.[1] ?? ''
    const rawTitle = block.match(/>([\s\S]*?)<\/a>/i)?.[1] ?? ''
    const snippet = block.match(/result__snippet[\s\S]*?>([\s\S]*?)<\/a>/i)?.[1]
      ?? block.match(/result__snippet[\s\S]*?>([\s\S]*?)<\/div>/i)?.[1]
      ?? ''
    return {
      url: unwrapSearchResultUrl(href),
      title: getText(decodeHtmlEntities(stripHtml(rawTitle)), 180),
      snippet: getText(decodeHtmlEntities(stripHtml(snippet)), 280),
    }
  }).filter((result) => /^https:\/\//i.test(result.url) && result.title)

  if (/\bharness\b/i.test(query)) {
    const preferred = /latest|new|news|mới nhất|moi nhat|thông tin mới|thong tin moi/i.test(query)
      ? results.filter((result) =>
        /harness\.io\/press-and-news|harness\.io\/blog/i.test(result.url) || /\bharness\b/i.test(`${result.title} ${result.snippet}`),
      )
      : results.filter((result) =>
        /harness\.io|docs\.harness\.io/i.test(result.url) || /\bharness\b/i.test(`${result.title} ${result.snippet}`),
      )
    return preferred.length ? preferred : results
  }

  return results
}

async function summarizeWebSource(rawUrl: string, fallbackTitle: string, fallbackSnippet = ''): Promise<SourceLedgerEntry> {
  const safeUrl = assertPublicHttpsUrl(rawUrl)
  const html = await fetchText(safeUrl)
  const summary = html
    ? extractPageSummary(html)
    : getText(fallbackSnippet || fallbackTitle, 400)

  return {
    kind: 'web',
    url: safeUrl,
    title: getText(fallbackTitle || safeUrl, 180),
    retrievedAt: new Date().toISOString(),
    summary: sanitizeSourceSummary(summary || fallbackSnippet || fallbackTitle || safeUrl, 900),
    confidence: html ? 'high' : 'medium',
  }
}

export async function researchWebSources(input: unknown, adminUser: unknown): Promise<SourceLedgerEntry[]> {
  const record = asRecord(input)
  const rawQuery = typeof record.query === 'string' ? record.query.trim() : ''
  const rawUrls = Array.isArray(record.urls) ? record.urls.slice(0, 3).map(assertHttpUrl) : []

  const curatedUrls = rawQuery ? getCuratedResearchUrls(rawQuery) : []
  const searched = rawQuery
    ? await searchWeb(rawQuery)
    : []
  const sources = [
    ...rawUrls.map((url) => ({ url, title: url, snippet: '' })),
    ...curatedUrls.map((url) => ({ url, title: url, snippet: '' })),
    ...searched,
  ].filter((source, index, self) => self.findIndex((item) => item.url === source.url) === index).slice(0, 4)

  if (sources.length === 0) {
    throw new AdminAiError('BAD_REQUEST', 'Provide a search query or at least one research URL.', 400)
  }

  const results = await Promise.all(sources.map((source) => summarizeWebSource(source.url, source.title, source.snippet)))
  return attachSourceReceipts(results, adminUser)
}

export async function readAttachmentSourceLedger(
  payload: PayloadResearchClient,
  adminUser: unknown,
  input: unknown,
): Promise<SourceLedgerEntry[]> {
  const rawAttachmentIds = asRecord(input).attachmentIds
  const attachmentIds = Array.isArray(rawAttachmentIds)
    ? rawAttachmentIds.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).slice(0, 5)
    : []
  if (attachmentIds.length === 0) throw new AdminAiError('BAD_REQUEST', 'attachmentIds is required.', 400)

  const entries: SourceLedgerEntry[] = []
  for (const id of attachmentIds) {
    const ref = asRecord(await payload.findByID({ collection: 'admin-ai-file-references', id, depth: 1 }))
    const file = asRecord(ref.file)
    const fileId = String(asRecord(ref.file).id ?? ref.file ?? '')

    if (String(ref.adminUserId ?? '') !== getAdminId(adminUser) || ref.deletedAt || file.deletedAt || file.status !== 'ready') {
      throw new AdminAiError('BAD_REQUEST', 'AI file attachment is not available.', 404)
    }

    const chunks = await payload.find({
      collection: 'admin-ai-file-chunks',
      limit: 20,
      depth: 0,
      sort: 'chunkIndex',
      where: { file: { equals: fileId } },
    })
    const summary = sanitizeSourceSummary((chunks.docs ?? []).map((chunk) => String(asRecord(chunk).content ?? '')).join('\n\n'))
    if (!summary) throw new AdminAiError('BAD_REQUEST', 'AI file attachment has no indexed text.', 400)

    entries.push({
      kind: 'file',
      title: String(ref.displayName ?? file.originalFilename ?? id).slice(0, 180),
      sourceId: id,
      retrievedAt: new Date().toISOString(),
      summary,
      confidence: 'medium',
    })
  }
  return attachSourceReceipts(entries, adminUser)
}

export async function readExistingPostSources(payload: PayloadResearchClient, adminUser: unknown, input: unknown): Promise<SourceLedgerEntry[]> {
  const query = typeof asRecord(input).query === 'string' ? String(asRecord(input).query).trim().slice(0, 120) : ''
  if (!query) throw new AdminAiError('BAD_REQUEST', 'query is required.', 400)

  const result = await payload.find({
    collection: 'posts',
    limit: 5,
    depth: 0,
    where: {
      and: [
        publishedNowWhere(),
        {
          or: [
            { title: { like: query } },
            { slug: { like: query } },
            { excerpt: { like: query } },
          ],
        },
      ],
    },
  })

  return attachSourceReceipts((result.docs ?? []).map((doc) => {
    const post = asRecord(doc)
    return {
      kind: 'existing-post',
      sourceId: String(post.id ?? ''),
      title: String(post.title ?? post.slug ?? 'Existing post').slice(0, 180),
      retrievedAt: new Date().toISOString(),
      summary: sanitizeSourceSummary(String(post.excerpt ?? post.slug ?? 'Existing GTKBlog post')),
      confidence: 'high',
    }
  }), adminUser)
}
