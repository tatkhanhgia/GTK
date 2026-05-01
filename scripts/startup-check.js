#!/usr/bin/env node
/**
 * Container Entrypoint.
 *
 * Runs before the Next.js server in the production Docker image
 * (`ENTRYPOINT` in Dockerfile). Order:
 *   1. Ensure DATABASE_URL is set
 *   2. Wait for Postgres to accept connections
 *   3. Run Payload-managed schema sync (`payload-db-sync.ts` via tsx)
 *      — applies pending prodMigrations so internal tables/columns are
 *      fully aligned with the current config before traffic hits
 *   4. Run the idempotent app bootstrap (`bootstrap-db.js`) — creates
 *      Better Auth + custom Drizzle tables and targeted compatibility
 *      fixes so operators never have to touch the database by hand
 *   5. Exec the downstream command (`node server.js`)
 *
 * Why tsx in the runtime image?
 *   Payload 3.81's programmatic `getPayload` path can load
 *   `payload.config.ts` through tsx, which is now a production
 *   dependency. The CLI loader path remains broken, but the
 *   programmatic path works with a one-line CJS interop patch applied
 *   during the Docker build (see Dockerfile).
 */
'use strict'

const { Client } = require('pg')
const { spawn } = require('child_process')
const { main: runBootstrap } = require('./bootstrap-db')
const path = require('path')

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

async function runPayloadSync() {
  return new Promise((resolve, reject) => {
    const syncScript = path.join(__dirname, 'payload-db-sync.ts')
    // Use tsx directly via its CLI entry point instead of npx to avoid
    // PATH resolution issues in minimal runtime images.
    const tsxPath = require.resolve('tsx')
    const child = spawn(process.execPath, [tsxPath, syncScript], {
      // Pipe stdin so we can auto-respond 'y' if Payload ever prompts
      // unexpectedly (defence-in-depth; dev-mode check should prevent it).
      stdio: ['pipe', 'inherit', 'inherit'],
      shell: false,
      env: {
        ...process.env,
        PAYLOAD_MIGRATING: 'true',
      },
    })

    child.stdin.write('y\n')
    child.stdin.end()

    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Payload sync exited with code ${code}`))
      }
    })
  })
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

  if (process.env.SKIP_PAYLOAD_SYNC === 'true') {
    log(`${YELLOW}⚠ SKIP_PAYLOAD_SYNC=true, skipping Payload sync${NC}`)
  } else {
    log('')
    log('⏳ Running Payload schema sync…')
    try {
      await runPayloadSync()
      log(`${GREEN}✓ Payload schema sync complete${NC}`)
    } catch (err) {
      log(`${RED}✗ Payload schema sync failed: ${err.message}${NC}`)
      log(`${RED}  Aborting startup. Inspect the logs above, fix the issue, then restart.${NC}`)
      process.exit(1)
    }
  }

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
