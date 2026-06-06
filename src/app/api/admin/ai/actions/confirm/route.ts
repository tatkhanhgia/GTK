import { NextResponse } from 'next/server'
import { requirePayloadAdminApi } from '@/lib/admin/payload-admin-api-auth'
import { AdminAiError } from '@/lib/admin-ai/admin-ai-chat-contract'
import { confirmAdminAiAction } from '@/lib/admin-ai/admin-ai-confirmation-service'

export const dynamic = 'force-dynamic'

function getId(body: unknown) {
  if (!body || typeof body !== 'object' || typeof (body as { id?: unknown }).id !== 'string') {
    throw new AdminAiError('BAD_REQUEST', 'Action id is required.', 400)
  }
  return (body as { id: string }).id
}

export async function POST(request: Request) {
  const { payload, user } = await requirePayloadAdminApi()
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Admin login required.' } }, { status: 401 })
  }

  try {
    const result = await confirmAdminAiAction(payload, user, getId(await request.json()))
    return NextResponse.json({ ok: true, result })
  } catch (error) {
    const status = error instanceof AdminAiError ? error.status : 500
    const code = error instanceof AdminAiError ? error.code : 'TOOL_ERROR'
    const message = error instanceof AdminAiError ? error.message : 'Could not confirm action.'
    return NextResponse.json({ error: { code, message } }, { status })
  }
}
