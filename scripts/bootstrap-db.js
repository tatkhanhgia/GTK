#!/usr/bin/env node
/**
 * Idempotent DB bootstrap.
 *
 * Runs BEFORE the Next.js server starts (from `scripts/startup-check.js`
 * in the Docker entrypoint, and as a `predev` hook locally). Applies known
 * schema drift fixes so the caller never has to touch the database by
 * hand.
 *
 * Why not `npx payload migrate`?
 *   On payload 3.81 + Next 15 + Node 22/24, the Payload CLI loads
 *   `payload.config.ts` through the `tsx/esm/api` programmatic loader,
 *   which mis-handles the extensionless relative imports at the top of
 *   that file (`./src/collections/users`, …) and triggers a
 *   `require(esm) cycle` error. There is no stable workaround in 3.81,
 *   and tsx is a devDependency that is NOT installed in the production
 *   runtime image anyway. So `npx payload migrate` is doubly broken at
 *   deploy time.
 *
 * This script talks to Postgres directly via `pg` (a transitive prod dep
 * of @payloadcms/db-postgres, so no extra install required), runs each
 * fix inside a single short transaction, and is safe to re-run. If a fix
 * is already applied it reports `up-to-date` and moves on.
 *
 * Add new entries to the FIXES array as the schema evolves. Each entry
 * must be idempotent — always check state before mutating.
 */
'use strict'

const { Client } = require('pg')

const FIXES = [
  {
    name: 'pages_locales.content varchar -> jsonb',
    async run(client) {
      const { rows } = await client.query(
        `SELECT data_type
         FROM information_schema.columns
         WHERE table_name = 'pages_locales' AND column_name = 'content'`,
      )
      if (rows.length === 0) {
        return { status: 'skipped', reason: 'column does not exist yet' }
      }
      const currentType = rows[0].data_type
      if (currentType === 'jsonb') {
        return { status: 'up-to-date' }
      }
      if (currentType !== 'character varying' && currentType !== 'text') {
        return {
          status: 'error',
          reason: `unexpected column type "${currentType}"; refusing to cast automatically`,
        }
      }
      // `USING "content"::jsonb` tells Postgres how to translate the text
      // into jsonb. Payload has always stored the Lexical editor state as
      // a valid JSON string in this column, so the cast is lossless.
      await client.query(
        `ALTER TABLE "pages_locales"
           ALTER COLUMN "content" SET DATA TYPE jsonb USING "content"::jsonb`,
      )
      return { status: 'applied' }
    },
  },
  // Add new fixes here. Template:
  // {
  //   name: 'short description',
  //   async run(client) {
  //     // 1. check current state via information_schema / pg_catalog
  //     // 2. return { status: 'up-to-date' } if already fixed
  //     // 3. otherwise apply ALTER ... and return { status: 'applied' }
  //   },
  // },
]

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('[bootstrap-db] DATABASE_URL is not set')
    return 2
  }

  if (process.env.SKIP_BOOTSTRAP === 'true') {
    console.log('[bootstrap-db] SKIP_BOOTSTRAP=true, skipping all fixes')
    return 0
  }

  const client = new Client({ connectionString })

  try {
    await client.connect()
  } catch (err) {
    console.error('[bootstrap-db] could not connect to Postgres:', err.message)
    return 1
  }

  console.log(`[bootstrap-db] connected (${FIXES.length} fix${FIXES.length === 1 ? '' : 'es'} to check)`)

  let errorCount = 0

  try {
    for (const fix of FIXES) {
      let result
      try {
        result = await fix.run(client)
      } catch (err) {
        console.error(`[bootstrap-db] FAILED: ${fix.name} — ${err.message}`)
        errorCount++
        continue
      }

      switch (result.status) {
        case 'applied':
          console.log(`[bootstrap-db] applied:    ${fix.name}`)
          break
        case 'up-to-date':
          console.log(`[bootstrap-db] up-to-date: ${fix.name}`)
          break
        case 'skipped':
          console.log(`[bootstrap-db] skipped:    ${fix.name} (${result.reason})`)
          break
        case 'error':
          console.error(`[bootstrap-db] ERROR:     ${fix.name} — ${result.reason}`)
          errorCount++
          break
        default:
          console.error(`[bootstrap-db] unknown status "${result.status}" for ${fix.name}`)
          errorCount++
      }
    }
  } finally {
    await client.end()
  }

  if (errorCount > 0) {
    console.error(`[bootstrap-db] ${errorCount} fix(es) failed — aborting startup`)
    return 1
  }

  console.log('[bootstrap-db] all fixes complete')
  return 0
}

if (require.main === module) {
  main()
    .then((code) => process.exit(code))
    .catch((err) => {
      console.error('[bootstrap-db] unexpected failure:', err)
      process.exit(1)
    })
}

module.exports = { main, FIXES }
