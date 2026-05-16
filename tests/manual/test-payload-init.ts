import { getPayload } from 'payload'
import configModule from '../../payload.config.ts'

async function main() {
  const config = await configModule
  console.log('Initializing Payload...')
  const payload = await getPayload({ config })
  console.log('Payload initialized!')
  console.log('DB adapter:', payload.db?.name)
  console.log('Collections:', Object.keys(payload.collections).join(', '))

  // Try to run migrate
  console.log('Running migrate...')
  await payload.db.migrate({ payload })
  console.log('Migrate complete!')

  await payload.db.destroy()
  console.log('Destroyed')
}

main().catch(err => {
  console.error('Error:', err.message)
  console.error(err.stack)
  process.exit(1)
})
