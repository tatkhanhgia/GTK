import type {
  AdminAiChatMessage,
  AdminAiChatResponse,
  AdminAiFileListResponse,
  AdminAiSafeProfile,
  AdminAiSessionDetail,
  AdminAiUploadResponse,
} from '@/lib/admin-ai/admin-ai-chat-contract'
import type { AdminAiMessage } from './admin-ai-message-list'

function getErrorMessage(value: unknown, fallback: string) {
  if (value && typeof value === 'object') {
    const error = (value as { error?: { message?: unknown } }).error
    if (typeof error?.message === 'string') return error.message
  }
  return fallback
}

async function readJsonResponse<T>(response: Response, fallback: string): Promise<T> {
  const payload = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(payload, fallback))
  return payload as T
}

export async function fetchAdminAiProfiles() {
  const payload = await readJsonResponse<{ profiles?: AdminAiSafeProfile[] }>(
    await fetch('/api/admin/ai/profiles'),
    'Không tải được AI profiles.',
  )
  return Array.isArray(payload.profiles) ? payload.profiles : []
}

export async function fetchAdminAiSessions() {
  const payload = await readJsonResponse<{ sessions?: AdminAiSessionDetail[] }>(
    await fetch('/api/admin/ai/sessions'),
    'Không tải được session AI.',
  )
  return Array.isArray(payload.sessions) ? payload.sessions : []
}

export async function createAdminAiSession() {
  const payload = await readJsonResponse<{ session: AdminAiSessionDetail }>(
    await fetch('/api/admin/ai/sessions', { method: 'POST' }),
    'Không tạo được session.',
  )
  return payload.session
}

export async function fetchAdminAiSession(id: string) {
  const payload = await readJsonResponse<{ session: AdminAiSessionDetail }>(
    await fetch(`/api/admin/ai/sessions/${id}`),
    'Không mở được session.',
  )
  return payload.session
}

export async function deleteAdminAiSession(id: string) {
  await readJsonResponse<{ ok: true }>(
    await fetch(`/api/admin/ai/sessions/${id}`, { method: 'DELETE' }),
    'Không xóa được session.',
  )
}

export async function updateAdminAiSessionMessages(id: string, messages: AdminAiMessage[]) {
  const payload = await readJsonResponse<{ session: AdminAiSessionDetail }>(
    await fetch(`/api/admin/ai/sessions/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages }),
    }),
    'Không cập nhật được session.',
  )
  return payload.session
}

export async function sendAdminAiChat(input: {
  profileId: string
  model?: string
  sessionId?: string
  messages: AdminAiChatMessage[]
}) {
  return readJsonResponse<AdminAiChatResponse>(
    await fetch('/api/admin/ai/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    }),
    'AI provider request failed.',
  )
}

export async function uploadAdminAiFile(file: File, sessionId?: string) {
  const formData = new FormData()
  formData.append('file', file)
  if (sessionId) formData.append('sessionId', sessionId)
  return readJsonResponse<AdminAiUploadResponse>(
    await fetch('/api/admin/ai/files', { method: 'POST', body: formData }),
    'Không upload được file.',
  )
}

export async function fetchAdminAiFiles() {
  const payload = await readJsonResponse<AdminAiFileListResponse>(
    await fetch('/api/admin/ai/files'),
    'Không tải được file AI.',
  )
  return Array.isArray(payload.attachments) ? payload.attachments : []
}

export async function deleteAdminAiFile(referenceId: string) {
  await readJsonResponse<{ ok: true }>(
    await fetch(`/api/admin/ai/files/${referenceId}`, { method: 'DELETE' }),
    'Không xóa được file AI.',
  )
}

export async function runAdminAiAction(id: string, action: 'confirm' | 'cancel') {
  await readJsonResponse<{ ok?: true }>(
    await fetch(`/api/admin/ai/actions/${action}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id }),
    }),
    'Không xử lý được hành động.',
  )
}
