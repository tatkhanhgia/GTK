console.log('step 1: before imports')
import { getPayload } from 'payload'
import config from '../../payload.config'
console.log('step 2: imports done')

async function main() {
  const payload = await getPayload({ config })
  console.log('step 3: connected')
}
main().then(() => process.exit(0)).catch(e => { console.error('ERROR:', e.message); process.exit(1) })
