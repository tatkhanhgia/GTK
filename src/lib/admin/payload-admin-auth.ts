import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isPayloadAdminUser } from './payload-admin-access'

export async function requirePayloadAdmin() {
  const payload = await getPayload({ config })
  const auth = await payload.auth({ headers: await headers() })
  if (!isPayloadAdminUser(auth.user)) {
    redirect('/admin/login')
  }
  return auth.user
}
