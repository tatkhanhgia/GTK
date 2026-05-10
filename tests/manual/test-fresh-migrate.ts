import { getPayload } from 'payload'
import configModule from '../../payload.config.ts'

async function main() {
  const config = await configModule
  console.log('[test] Initializing Payload...')
  const payload = await getPayload({ config, disableOnInit: true })
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
