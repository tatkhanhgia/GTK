import { NextResponse } from 'next/server'
import { requirePayloadAdminApi } from '@/lib/admin/payload-admin-api-auth'
import { AdminAiError } from '@/lib/admin-ai/admin-ai-chat-contract'
import {
  deleteAdminAiFileReference,
  getAdminAiFileReference,
  type PayloadAdminAiFileClient,
} from '@/lib/admin-ai/files/admin-ai-file-storage-service'

export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{ id: string }>
}

function errorResponse(error: unknown) {
  if (error instanceof AdminAiError) {
    return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.status })
  }
  return NextResponse.json(
    { error: { code: 'BAD_REQUEST', message: 'Admin AI file request failed.' } },
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
    const attachment = await getAdminAiFileReference(payload as PayloadAdminAiFileClient, user, id)
    return NextResponse.json({ attachment })
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
    await deleteAdminAiFileReference(payload as PayloadAdminAiFileClient, user, id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return errorResponse(error)
  }
}
