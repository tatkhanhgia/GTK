import { NextResponse } from 'next/server'
import { requirePayloadAdminApi } from '@/lib/admin/payload-admin-api-auth'
import { AdminAiError } from '@/lib/admin-ai/admin-ai-chat-contract'
import { createAdminAiSession, listAdminAiSessions } from '@/lib/admin-ai/admin-ai-session-service'

export const dynamic = 'force-dynamic'

function errorResponse(error: unknown) {
  if (error instanceof AdminAiError) {
    return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.status })
  }
  return NextResponse.json(
    { error: { code: 'BAD_REQUEST', message: 'AI session request failed.' } },
    { status: 500 },
  )
}

export async function GET() {
  const { payload, user } = await requirePayloadAdminApi()
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Admin login required.' } }, { status: 401 })
  }

  try {
    const sessions = await listAdminAiSessions(payload, user)
    return NextResponse.json({ sessions })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST() {
  const { payload, user } = await requirePayloadAdminApi()
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Admin login required.' } }, { status: 401 })
  }

  try {
    const session = await createAdminAiSession(payload, user)
    return NextResponse.json({ session }, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}
