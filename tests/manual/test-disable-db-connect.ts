import { getPayload } from 'payload'
import configModule from '../../payload.config.ts'

async function main() {
  const config = await configModule
  console.log('[test] Initializing Payload with disableDBConnect...')
  const payload = await getPayload({ config, disableOnInit: true, disableDBConnect: true })
  console.log('[test] Payload initialized (no DB connect)')
  console.log('[test] DB adapter:', payload.db?.name)

  console.log('[test] Connecting to DB manually...')
  await payload.db.connect({ payload })
  console.log('[test] Connected')

  console.log('[test] Running migrate...')
  await payload.db.migrate({ payload })
  console.log('[test] Migrate complete!')

  await payload.db.destroy()
  console.log('[test] Done')
}

main().catch(err => {
  console.error('[test] Error:', err.message)
  console.error(err.stack)
  process.exit(1)
})
