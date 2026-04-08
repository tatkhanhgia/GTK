/**
 * Standalone fix for pages_locales.content still being `varchar` on
 * environments whose database was created via Payload dev-mode schema
 * push before the `20260408_155700_ensure_pages_content_jsonb` migration
 * existed.
 *
 * Why not `npx payload migrate`?
 *   Payload's CLI entry (`node_modules/payload/bin.js`) uses the
 *   `tsx/esm/api` programmatic loader, which currently mis-handles
 *   extensionless relative imports inside `payload.config.ts` under
 *   Node.js 22+ and triggers a `require(esm) cycle` error. The payload
 *   team is aware of this interaction with Next.js 15 + Node 22/24 but
 *   no stable workaround ships with 3.81. This script bypasses the CLI
 *   entirely and talks to Postgres directly via `pg`.
 *
 * What it does:
 *   1. Loads DATABASE_URL from `.env.local` (via the existing
 *      `patch-next-env.cjs` preload that `npm run seed` also uses).
 *   2. Connects to Postgres.
 *   3. Checks `information_schema.columns` for `pages_locales.content`.
 *      - If already `jsonb`: prints and exits 0 (idempotent).
 *      - If `character varying`: runs
 *        `ALTER TABLE "pages_locales" ALTER COLUMN "content" SET DATA TYPE jsonb USING "content"::jsonb;`
 *      - Any other type: prints a warning and exits non-zero so the
 *        caller can investigate manually.
 *
 * Usage:
 *   npx tsx --require ./src/scripts/patch-next-env.cjs src/scripts/fix-pages-content-jsonb.ts
 *
 * Equivalent raw SQL fallback (no Node required):
 *   psql "$DATABASE_URL" -c 'ALTER TABLE "pages_locales" ALTER COLUMN "content" SET DATA TYPE jsonb USING "content"::jsonb;'
 */
import { Client } from 'pg'

const TABLE = 'pages_locales'
const COLUMN = 'content'

async function main(): Promise<number> {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error(
      '[fix-pages-content-jsonb] DATABASE_URL is not set. Make sure you ran this script with:\n' +
        '  npx tsx --require ./src/scripts/patch-next-env.cjs src/scripts/fix-pages-content-jsonb.ts',
    )
    return 2
  }

  const client = new Client({ connectionString })
  await client.connect()

  try {
    const { rows } = await client.query<{ data_type: string }>(
      `SELECT data_type
       FROM information_schema.columns
       WHERE table_name = $1 AND column_name = $2`,
      [TABLE, COLUMN],
    )

    if (rows.length === 0) {
      console.error(`[fix-pages-content-jsonb] Column ${TABLE}.${COLUMN} does not exist.`)
      return 3
    }

    const currentType = rows[0].data_type
    console.log(`[fix-pages-content-jsonb] current type of ${TABLE}.${COLUMN}: ${currentType}`)

    if (currentType === 'jsonb') {
      console.log('[fix-pages-content-jsonb] already jsonb, nothing to do.')
      return 0
    }

    if (currentType !== 'character varying' && currentType !== 'text') {
      console.error(
        `[fix-pages-content-jsonb] unexpected column type "${currentType}". Refusing to cast; ` +
          'inspect the column manually before proceeding.',
      )
      return 4
    }

    console.log(
      `[fix-pages-content-jsonb] casting ${TABLE}.${COLUMN} ${currentType} → jsonb ` +
        'with USING clause …',
    )
    await client.query(
      `ALTER TABLE "${TABLE}" ALTER COLUMN "${COLUMN}" SET DATA TYPE jsonb USING "${COLUMN}"::jsonb`,
    )
    console.log('[fix-pages-content-jsonb] done.')
    return 0
  } finally {
    await client.end()
  }
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error('[fix-pages-content-jsonb] failed:', err)
    process.exit(1)
  })
