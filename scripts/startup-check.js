#!/usr/bin/env node
/**
 * Container Entrypoint.
 *
 * Runs before the Next.js server in the production Docker image
 * (`ENTRYPOINT` in Dockerfile). Order:
 *   1. Ensure DATABASE_URL is set
 *   2. Wait for Postgres to accept connections
 *   3. Run the idempotent DB bootstrap (`bootstrap-db.js`) — this
 *      applies any known schema drift fixes so operators never have to
 *      touch the database by hand
 *   4. Exec the downstream command (`node server.js`)
 *
 * Why not `npx payload migrate`?
 *   - `tsx` is a devDependency, not installed in the production runtime
 *     image — the Payload CLI needs tsx to load `payload.config.ts`, so
 *     the CLI simply cannot run here.
 *   - Even where tsx IS installed (local dev), the `tsx/esm/api`
 *     programmatic loader used by `node_modules/payload/bin.js` on
 *     payload 3.81 hits a `require(esm) cycle` error under Node 22/24
 *     while resolving the extensionless relative imports in
 *     `payload.config.ts`.
 *   See `scripts/bootstrap-db.js` for the idempotent schema-fix approach
 *   we use instead.
 */
'use strict'

const { Client } = require('pg')
const { spawn } = require('child_process')
const { main: runBootstrap } = require('./bootstrap-db')

const YELLOW = '\x1b[1;33m'
const RED = '\x1b[0;31m'
const GREEN = '\x1b[0;32m'
const NC = '\x1b[0m'

function log(msg) {
  console.log(msg)
}

async function waitForDatabase({ retries = 30, intervalMs = 2000 } = {}) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const client = new Client({ connectionString: process.env.DATABASE_URL })
    try {
      await client.connect()
      await client.query('SELECT 1')
      await client.end()
      return true
    } catch (err) {
      try {
        await client.end()
      } catch {
        /* ignore */
      }
      if (attempt === retries) {
        log(`${RED}✗ Could not connect to Postgres after ${retries} attempts: ${err.message}${NC}`)
        return false
      }
      log(`${YELLOW}  waiting for Postgres (${attempt}/${retries})…${NC}`)
      await new Promise((r) => setTimeout(r, intervalMs))
    }
  }
  return false
}

async function main() {
  log('==========================================')
  log('  GTKBlog Startup Check')
  log('==========================================')
  log('')

  if (!process.env.DATABASE_URL) {
    log(`${RED}ERROR: DATABASE_URL not set${NC}`)
    process.exit(1)
  }

  log('⏳ Checking database connection…')
  const dbReady = await waitForDatabase()
  if (!dbReady) {
    process.exit(1)
  }
  log(`${GREEN}✓ Database reachable${NC}`)

  log('')
  log('⏳ Running DB bootstrap…')
  const bootstrapCode = await runBootstrap()
  if (bootstrapCode !== 0) {
    log(`${RED}✗ DB bootstrap failed with exit code ${bootstrapCode}${NC}`)
    log(`${RED}  Aborting startup. Inspect the logs above, fix the issue, then restart.${NC}`)
    process.exit(bootstrapCode)
  }
  log(`${GREEN}✓ DB bootstrap complete${NC}`)

  log('')
  log('==========================================')
  log('  Starting Application…')
  log('==========================================')
  log('')

  // Forward the CMD (e.g. `node server.js`) as-is. Using spawn with
  // stdio:'inherit' keeps this process as the container PID 1 so Docker
  // signals (SIGTERM, SIGINT) propagate to the child cleanly.
  const args = process.argv.slice(2)
  if (args.length === 0) {
    log(`${YELLOW}No downstream command provided; exiting.${NC}`)
    process.exit(0)
  }

  const child = spawn(args[0], args.slice(1), { stdio: 'inherit', shell: false })

  const forward = (signal) => () => child.kill(signal)
  process.on('SIGTERM', forward('SIGTERM'))
  process.on('SIGINT', forward('SIGINT'))

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal)
    } else {
      process.exit(code ?? 0)
    }
  })
}

main().catch((err) => {
  console.error('Startup check failed:', err)
  process.exit(1)
})
