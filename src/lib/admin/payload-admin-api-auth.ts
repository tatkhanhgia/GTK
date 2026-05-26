import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isPayloadAdminUser } from './payload-admin-access'

export async function requirePayloadAdminApi() {
  const payload = await getPayload({ config })
  const auth = await payload.auth({ headers: await headers() })
  if (!isPayloadAdminUser(auth.user)) {
    return { payload, user: null }
  }
  return { payload, user: auth.user }
}
