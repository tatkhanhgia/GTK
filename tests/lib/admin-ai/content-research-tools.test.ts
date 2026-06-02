import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  readExistingPostSources,
  researchWebSources,
  setResearchFetchTextForTests,
} from '@/lib/admin-ai/tools/content-research-tools'

describe('content research tools', () => {
  beforeEach(() => {
    setResearchFetchTextForTests()
  })

  it('rejects localhost web research URLs without fetching', async () => {
    await expect(researchWebSources({ urls: ['https://localhost/private'] }, { id: 'admin-1' }))
      .rejects.toMatchObject({ code: 'BAD_REQUEST' })
    await expect(researchWebSources({ urls: ['https://127.0.0.1/private'] }, { id: 'admin-1' }))
      .rejects.toMatchObject({ code: 'BAD_REQUEST' })
    await expect(researchWebSources({ urls: ['https://169.254.169.254/latest/meta-data'] }, { id: 'admin-1' }))
      .rejects.toMatchObject({ code: 'BAD_REQUEST' })
  })

  it('searches public web results and fetches source summaries', async () => {
    setResearchFetchTextForTests(async (url: string) => {
      if (String(url).includes('html.duckduckgo.com')) {
        return `
          <html><body>
            <a rel="nofollow" class="result__a" href="https://example.com/research">Gemma 4 official notes</a>
            <div class="result__snippet">Gemma 4 introduces a stronger multimodal stack.</div>
          </body></html>
        `
      }
      if (String(url) === 'https://example.com/research') {
        return `
          <html>
            <head>
              <title>Gemma 4 official notes</title>
              <meta name="description" content="Gemma 4 introduces a stronger multimodal stack." />
            </head>
            <body><p>Gemma 4 introduces a stronger multimodal stack for production workloads.</p></body>
          </html>
        `
      }
      throw new Error(`Unexpected fetch: ${String(url)}`)
    })

    const entries = await researchWebSources({ query: 'Gemma 4' }, { id: 'admin-1' })

    expect(entries[0]).toMatchObject({
      kind: 'web',
      url: 'https://example.com/research',
      confidence: 'high',
    })
    expect(entries[0].summary).toContain('Gemma 4 official notes')
    expect(entries[0].summary).toContain('stronger multimodal stack')
    expect(entries[0].receipt).toMatch(/^admin-ai-src:v1:/)
  })

  it('fetches explicit web URLs and summarizes page content', async () => {
    setResearchFetchTextForTests(async (url: string) => {
      if (String(url) === 'https://example.com/research') {
        return `
          <html>
            <head><title>Example Research</title></head>
            <body><p>Example research summary for local testing.</p></body>
          </html>
        `
      }
      throw new Error(`Unexpected fetch: ${String(url)}`)
    })

    const entries = await researchWebSources({ urls: ['https://example.com/research'] }, { id: 'admin-1' })

    expect(entries[0]).toMatchObject({
      kind: 'web',
      url: 'https://example.com/research',
      confidence: 'high',
    })
    expect(entries[0].summary).toContain('Example Research')
    expect(entries[0].summary).toContain('local testing')
  })

  it('rejects redirect targets that land on private hosts', async () => {
    setResearchFetchTextForTests(async (url: string) => {
      if (url === 'https://example.com/research') {
        throw new Error('should not be called when URL validation fails')
      }
      return ''
    })

    await expect(researchWebSources({ urls: ['https://metadata.google.internal/latest'] }, { id: 'admin-1' }))
      .rejects.toMatchObject({ code: 'BAD_REQUEST' })
  })

  it('filters existing post sources to published-now content', async () => {
    const payload = {
      find: vi.fn().mockResolvedValue({ docs: [] }),
      findByID: vi.fn(),
    }

    await readExistingPostSources(payload, { id: 'admin-1' }, { query: 'payload' })

    expect(payload.find).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'posts',
      where: expect.objectContaining({
        and: expect.arrayContaining([
          expect.objectContaining({
            and: expect.arrayContaining([
              { status: { equals: 'published' } },
            ]),
          }),
        ]),
      }),
    }))
  })
})
