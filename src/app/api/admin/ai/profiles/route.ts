import { NextResponse } from 'next/server'
import { requirePayloadAdminApi } from '@/lib/admin/payload-admin-api-auth'
import { listSafeAdminAiProfiles } from '@/lib/admin-ai/admin-ai-profile-service'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { payload, user } = await requirePayloadAdminApi()
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Admin login required.' } }, { status: 401 })
  }

  const profiles = await listSafeAdminAiProfiles(payload)
  return NextResponse.json({ profiles })
}
