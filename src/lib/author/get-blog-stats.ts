import { sql } from 'drizzle-orm'
import type { Locale } from '@/i18n/config'
import type { AchievementItem } from '@/components/sections/achievements-section'
import { publishedNowWhere } from '@/lib/content/publication-state'

const shouldSkipBuildDbAccess = process.env.SKIP_BUILD_DB_ACCESS === 'true'

/**
 * Compute live, blog-focused stats for the Achievements section used on
 * both the homepage and the About page.
 *
 * Numbers are real — sourced from Payload collections and the Drizzle
 * newsletter table — so these pages never show fake "years of experience"
 * career metrics. Career/journey numbers live on `/me` via QuickStats.
 *
 * All counts are fetched in parallel and wrapped in `allSettled` so that a
 * failure on any single query (e.g. brand-new install with missing tables)
 * degrades gracefully to `0` instead of breaking the page.
 */
export async function getBlogStats(locale: Locale): Promise<AchievementItem[]> {
  const isVi = locale === 'vi'

  if (shouldSkipBuildDbAccess) {
    return [
      {
        label: isVi ? 'Bài viết đã xuất bản' : 'Articles published',
        value: 0,
        suffix: '',
        icon: 'file-text',
      },
      {
        label: isVi ? 'Chủ đề bao phủ' : 'Topics covered',
        value: 0,
        suffix: '',
        icon: 'sparkles',
      },
      {
        label: isVi ? 'Sản phẩm số' : 'Digital products',
        value: 0,
        suffix: '',
        icon: 'rocket',
      },
      {
        label: isVi ? 'Người đăng ký nhận bài' : 'Newsletter subscribers',
        value: 0,
        suffix: '',
        icon: 'users',
      },
    ]
  }

  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('@payload-config'),
  ])
  const payload = await getPayload({ config })

  const [postsResult, productsResult, categoriesResult, subscribersResult] =
    await Promise.allSettled([
      // limit: 0 is the lightest way to ask Payload for `totalDocs` only.
      payload.find({
        collection: 'posts',
        where: publishedNowWhere(),
        limit: 0,
        depth: 0,
      }),
      payload.find({
        collection: 'products',
        where: { status: { equals: 'published' } },
        limit: 0,
        depth: 0,
      }),
      payload.find({
        collection: 'categories',
        where: { type: { equals: 'blog' } },
        limit: 0,
        depth: 0,
      }),
      // Newsletter lives in a custom Drizzle table; reuse Payload's managed
      // connection to avoid opening a second pool.
      (async () => {
        const drizzle = payload.db.drizzle as unknown as {
          execute: (q: ReturnType<typeof sql>) => Promise<{ rows: Array<Record<string, unknown>> }>
        }
        const result = await drizzle.execute(
          sql`SELECT COUNT(*)::int AS count FROM "newsletter_subscribers" WHERE "status" = 'active'`,
        )
        const row = result.rows?.[0] as { count?: number | string } | undefined
        return Number(row?.count ?? 0)
      })(),
    ])

  const postsCount =
    postsResult.status === 'fulfilled' ? postsResult.value.totalDocs : 0
  const productsCount =
    productsResult.status === 'fulfilled' ? productsResult.value.totalDocs : 0
  const categoriesCount =
    categoriesResult.status === 'fulfilled' ? categoriesResult.value.totalDocs : 0
  const subscribersCount =
    subscribersResult.status === 'fulfilled' ? subscribersResult.value : 0

  // Universal "+" suffix meaning "at least this many" — applied to every
  // non-zero count so small blogs still read well visually.
  const plus = (n: number) => (n > 0 ? '+' : '')

  return [
    {
      label: isVi ? 'Bài viết đã xuất bản' : 'Articles published',
      value: postsCount,
      suffix: plus(postsCount),
      icon: 'file-text',
    },
    {
      label: isVi ? 'Chủ đề bao phủ' : 'Topics covered',
      value: categoriesCount,
      // Topics/categories are exact by nature — no "+" padding.
      suffix: '',
      icon: 'sparkles',
    },
    {
      label: isVi ? 'Sản phẩm số' : 'Digital products',
      value: productsCount,
      suffix: plus(productsCount),
      icon: 'rocket',
    },
    {
      label: isVi ? 'Người đăng ký nhận bài' : 'Newsletter subscribers',
      value: subscribersCount,
      suffix: plus(subscribersCount),
      icon: 'users',
    },
  ]
}
