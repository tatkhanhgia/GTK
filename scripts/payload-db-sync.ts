import { getPayload } from 'payload'
import configModule from '../payload.config'

const PREFIX = '[payload-db-sync]'

function log(msg: string) {
  console.log(`${PREFIX} ${msg}`)
}

function warn(msg: string) {
  console.warn(`${PREFIX} ${msg}`)
}

function error(msg: string) {
  console.error(`${PREFIX} ${msg}`)
}

/**
 * Quick DB check to detect dev-mode migration state without
 * pulling in the full Payload init path.
 */
async function checkDevMigrationState(): Promise<{
  hasMigrationTable: boolean
  hasDevMigration: boolean
}> {
  // Use pg directly (transitive dependency) for a lightweight check
  const { Client } = await import('pg')
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  try {
    await client.connect()
    const { rows: tableRows } = await client.query(
      `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payload_migrations'`,
    )
    if (tableRows.length === 0) {
      return { hasMigrationTable: false, hasDevMigration: false }
    }
    const { rows: devRows } = await client.query(
      `SELECT 1 FROM payload_migrations WHERE batch = -1 LIMIT 1`,
    )
    return { hasMigrationTable: true, hasDevMigration: devRows.length > 0 }
  } catch {
    return { hasMigrationTable: false, hasDevMigration: false }
  } finally {
    await client.end().catch(() => {})
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    error('DATABASE_URL is not set')
    process.exit(2)
  }

  process.env.PAYLOAD_MIGRATING = 'true'

  log('Checking migration state...')
  const { hasDevMigration } = await checkDevMigrationState()

  if (hasDevMigration) {
    warn('Dev-mode migration detected (batch: -1). Skipping Payload migrations.')
    warn('If schema drift exists, generate a proper migration or recreate the DB.')
    process.exit(0)
  }

  log('Loading Payload config...')
  const config = await configModule

  log('Initializing Payload (migrations mode)...')
  const payload = await getPayload({
    config,
    disableOnInit: true,
  })

  log('Running migrations...')
  await payload.db.migrate()
  log('Migrations complete')

  await payload.db.destroy?.()
  log('Disconnected')
}

main()
  .then(() => {
    log('Done')
    process.exit(0)
  })
  .catch((err: Error) => {
    error(`Failed: ${err.message}`)
    if (process.env.PAYLOAD_SYNC_DEBUG === 'true') {
      console.error(err)
    }
    process.exit(1)
  })
