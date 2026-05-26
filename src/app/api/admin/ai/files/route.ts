import { NextResponse } from 'next/server'
import { requirePayloadAdminApi } from '@/lib/admin/payload-admin-api-auth'
import { AdminAiError, type AdminAiFileListResponse, type AdminAiUploadResponse } from '@/lib/admin-ai/admin-ai-chat-contract'
import {
  createAdminAiFileReference,
  listAdminAiFileReferences,
  type PayloadAdminAiFileClient,
} from '@/lib/admin-ai/files/admin-ai-file-storage-service'

export const dynamic = 'force-dynamic'

function errorResponse(error: unknown) {
  if (error instanceof AdminAiError) {
    return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.status })
  }
  return NextResponse.json(
    { error: { code: 'BAD_REQUEST', message: 'Admin AI file request failed.' } },
    { status: 500 },
  )
}

function asUploadFile(value: FormDataEntryValue | null) {
  if (!value || typeof value !== 'object' || !('arrayBuffer' in value) || !('name' in value) || !('size' in value)) {
    throw new AdminAiError('BAD_REQUEST', 'File is required.', 400)
  }
  return value as unknown as { name: string; type?: string; size: number; arrayBuffer: () => Promise<ArrayBuffer> }
}

export async function GET() {
  const { payload, user } = await requirePayloadAdminApi()
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Admin login required.' } }, { status: 401 })
  }

  try {
    const response: AdminAiFileListResponse = {
      attachments: await listAdminAiFileReferences(payload as PayloadAdminAiFileClient, user),
    }
    return NextResponse.json(response)
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request: Request) {
  const { payload, user } = await requirePayloadAdminApi()
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Admin login required.' } }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const sessionId = formData.get('sessionId')
    const result = await createAdminAiFileReference({
      payload: payload as PayloadAdminAiFileClient,
      adminUser: user,
      file: asUploadFile(formData.get('file')),
      sessionId: typeof sessionId === 'string' && sessionId.trim() ? sessionId.trim() : undefined,
    })
    const response: AdminAiUploadResponse = result
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}
