import { AdminAiError } from '../admin-ai-chat-contract'
import { lookup } from 'node:dns/promises'
import { request } from 'node:https'
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

type FetchTextFn = (url: string, timeoutMs?: number) => Promise<string>

type ResolvedAddress = {
  address: string
  family: 4 | 6
}

function isPrivateHostname(hostname: string) {
  return hostname === 'localhost' || hostname.endsWith('.localhost') || hostname === 'metadata.google.internal'
}

function isPrivateIpLiteral(hostname: string) {
  if (!isIP(hostname)) return false
  const normalized = hostname.toLowerCase()
  if (
    normalized === '::1' ||
    normalized === '::' ||
    normalized.startsWith('fe80:') ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('::ffff:127.') ||
    normalized.startsWith('::ffff:10.') ||
    normalized.startsWith('::ffff:192.168.') ||
    normalized.startsWith('::ffff:172.16.') ||
    normalized.startsWith('::ffff:172.17.') ||
    normalized.startsWith('::ffff:172.18.') ||
    normalized.startsWith('::ffff:172.19.') ||
    normalized.startsWith('::ffff:172.2') ||
    normalized.startsWith('::ffff:169.254.') ||
    normalized.startsWith('::ffff:0.')
  ) return true
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

async function resolvePublicAddress(url: URL): Promise<ResolvedAddress> {
  if (isPrivateHostname(url.hostname) || isPrivateIpLiteral(url.hostname)) {
    throw new AdminAiError('BAD_REQUEST', 'Research URL host is not allowed.', 400)
  }

  if (isIP(url.hostname)) {
    return {
      address: url.hostname,
      family: (isIP(url.hostname) === 6 ? 6 : 4),
    }
  }

  const resolved = await lookup(url.hostname, { all: true, verbatim: true })
  if (!resolved.length || resolved.some((entry) => isPrivateIpLiteral(entry.address))) {
    throw new AdminAiError('BAD_REQUEST', 'Research URL resolves to a private or reserved address.', 400)
  }

  const first = resolved[0]
  return { address: first.address, family: first.family as 4 | 6 }
}

async function requestPublicHttpsText(rawUrl: string, timeoutMs = 12000, redirectsRemaining = 3): Promise<string> {
  const url = new URL(assertPublicHttpsUrl(rawUrl))
  const resolved = await resolvePublicAddress(url)

  if (redirectsRemaining < 0) return ''

  const path = `${url.pathname}${url.search}`
  const headers: Record<string, string> = {
    'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) GTKBlog-Admin-AI/1.0',
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'accept-encoding': 'identity',
    host: url.host,
  }

  return await new Promise<string>((resolve) => {
    const req = request({
      protocol: 'https:',
      hostname: resolved.address,
      family: resolved.family,
      servername: url.hostname,
      port: url.port ? Number(url.port) : 443,
      path,
      method: 'GET',
      headers,
      timeout: timeoutMs,
    }, (response) => {
      const statusCode = response.statusCode ?? 0
      const location = response.headers.location
      if (statusCode >= 300 && statusCode < 400 && location) {
        response.resume()
        const redirectUrl = new URL(location, url).toString()
        void requestPublicHttpsText(redirectUrl, timeoutMs, redirectsRemaining - 1).then(resolve).catch(() => resolve(''))
        return
      }
      if (statusCode < 200 || statusCode >= 300) {
        response.resume()
        resolve('')
        return
      }

      response.setEncoding('utf8')
      const chunks: string[] = []
      response.on('data', (chunk) => chunks.push(chunk))
      response.on('end', () => resolve(chunks.join('')))
    })

    req.on('timeout', () => req.destroy(new Error('timeout')))
    req.on('error', () => resolve(''))
    req.end()
  })
}

let fetchTextImpl: FetchTextFn = requestPublicHttpsText

export function setResearchFetchTextForTests(fetcher?: FetchTextFn) {
  fetchTextImpl = fetcher ?? requestPublicHttpsText
}

async function fetchText(url: string, timeoutMs = 12000) {
  try {
    return await fetchTextImpl(url, timeoutMs)
  } catch {
    return ''
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
