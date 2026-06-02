import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { publishedNowWhere } from '@/lib/content/publication-state'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/**
 * GET /[locale]/blog/feed.xml
 * Generates an RSS 2.0 feed for blog posts in the requested locale.
 * Returns empty channel on DB unavailability — never errors to client.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params
  const loc = locale === 'en' ? 'en' : 'vi'

  type PostDoc = {
    title: unknown
    slug: string
    excerpt: unknown
    publishedAt?: string | null
  }

  let posts: PostDoc[] = []

  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'posts',
      locale: loc,
      where: publishedNowWhere(),
      sort: '-publishedAt',
      limit: 20,
      depth: 0,
    })
    posts = result.docs as unknown as PostDoc[]
  } catch {
    // DB unavailable — serve empty feed rather than 500
  }

  const feedItems = posts
    .map((post) => {
      const title = typeof post.title === 'string' ? post.title : String(post.title ?? '')
      const excerpt = typeof post.excerpt === 'string' ? post.excerpt : ''
      const postUrl = `${APP_URL}/${loc}/blog/${post.slug}`
      const pubDate = post.publishedAt
        ? new Date(post.publishedAt).toUTCString()
        : new Date().toUTCString()

      return `
    <item>
      <title><![CDATA[${title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${excerpt}]]></description>
    </item>`
    })
    .join('\n')

  const blogTitle =
    loc === 'vi' ? 'GTKBlog — Blog Công Nghệ & AI' : 'GTKBlog — Tech & AI Blog'
  const blogDesc =
    loc === 'vi'
      ? 'Bài viết về AI, công nghệ và lập trình'
      : 'Articles about AI, technology, and programming'
  const feedUrl = `${APP_URL}/${loc}/blog/feed.xml`

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${blogTitle}</title>
    <link>${APP_URL}/${loc}/blog</link>
    <description>${blogDesc}</description>
    <language>${loc === 'vi' ? 'vi-VN' : 'en'}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    ${feedItems}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
