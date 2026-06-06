import { NextResponse } from 'next/server'
import { requirePayloadAdminApi } from '@/lib/admin/payload-admin-api-auth'
import { AdminAiError } from '@/lib/admin-ai/admin-ai-chat-contract'
import {
  deleteAdminAiSession,
  getAdminAiSession,
  replaceAdminAiSessionMessages,
} from '@/lib/admin-ai/admin-ai-session-service'

export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{ id: string }>
}

function errorResponse(error: unknown) {
  if (error instanceof AdminAiError) {
    return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.status })
  }
  return NextResponse.json(
    { error: { code: 'BAD_REQUEST', message: 'AI session request failed.' } },
    { status: 500 },
  )
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { payload, user } = await requirePayloadAdminApi()
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Admin login required.' } }, { status: 401 })
  }

  try {
    const { id } = await params
    const session = await getAdminAiSession(payload, user, id)
    return NextResponse.json({ session })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { payload, user } = await requirePayloadAdminApi()
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Admin login required.' } }, { status: 401 })
  }

  try {
    const { id } = await params
    await deleteAdminAiSession(payload, user, id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { payload, user } = await requirePayloadAdminApi()
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Admin login required.' } }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const session = await replaceAdminAiSessionMessages(
      payload,
      user,
      id,
      body && typeof body === 'object' ? (body as { messages?: unknown }).messages : [],
    )
    return NextResponse.json({ session })
  } catch (error) {
    return errorResponse(error)
  }
}
