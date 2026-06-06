export type AdminAiChatRole = 'system' | 'user' | 'assistant'

export type AdminAiChatMessage = {
  role: AdminAiChatRole
  content: string
  attachmentIds?: string[]
}

export type AdminAiAttachment = {
  referenceId: string
  fileId?: string
  filename: string
  mimeType?: string
  byteSize?: number
  status?: 'uploading' | 'ready' | 'failed' | 'deleted'
  error?: string
  createdAt?: string
}

export type AdminAiPendingAction = {
  id: string
  toolName: string
  summary: string
  expiresAt: string
}

export type AdminAiToolResult = {
  toolName: string
  output: unknown
}

export type AdminAiChatRequest = {
  profileId?: string
  model?: string
  sessionId?: string
  messages: AdminAiChatMessage[]
}

export type AdminAiSessionMessage = {
  id: string
  role: 'assistant' | 'user'
  body: string
  createdAt: string
  status?: 'read' | 'pending-write'
  attachments?: AdminAiAttachment[]
  pendingActions?: AdminAiPendingAction[]
  toolResults?: AdminAiToolResult[]
}

export type AdminAiSessionDetail = {
  id: string
  title: string
  adminUserEmail?: string
  profileId?: string
  model?: string
  messages: AdminAiSessionMessage[]
  messageCount: number
  lastMessageAt: string
  updatedAt: string
  createdAt: string
}

export type AdminAiChatResponse = {
  message: { role: 'assistant'; content: string }
  model: string
  sessionId?: string
  session?: AdminAiSessionDetail
  usage?: {
    inputTokens?: number
    outputTokens?: number
    totalTokens?: number
  }
  pendingActions?: AdminAiPendingAction[]
  toolResults?: AdminAiToolResult[]
}

export type AdminAiUploadResponse = {
  attachment: AdminAiAttachment
  reused: boolean
}

export type AdminAiFileListResponse = {
  attachments: AdminAiAttachment[]
}

export type AdminAiSafeProfile = {
  id: string
  name: string
  providerType: string
  baseUrl: string
  defaultModel: string
  modelOptions: string[]
  agentRole?: string
  communicationStyle?: string
  operationalContext?: string
  toolUsageRules?: string
  customInstructions?: string
  enabled: boolean
}

export type AdminAiErrorCode =
  | 'BAD_REQUEST'
  | 'NO_PROFILE'
  | 'DISABLED_PROFILE'
  | 'PROVIDER_ERROR'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'TOOL_ERROR'

export class AdminAiError extends Error {
  constructor(
    public code: AdminAiErrorCode,
    message: string,
    public status = 400,
  ) {
    super(message)
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function parseAttachmentIds(value: unknown) {
  if (value === undefined) return undefined
  if (!Array.isArray(value)) {
    throw new AdminAiError('BAD_REQUEST', 'Attachment ids must be an array.')
  }
  if (value.length > 5) {
    throw new AdminAiError('BAD_REQUEST', 'A message can include up to 5 attachments.')
  }
  return value.map((item) => {
    if (typeof item !== 'string' || !item.trim()) {
      throw new AdminAiError('BAD_REQUEST', 'Attachment ids must be strings.')
    }
    return item.trim()
  })
}

function parseMessage(value: unknown): AdminAiChatMessage {
  if (!isRecord(value)) {
    throw new AdminAiError('BAD_REQUEST', 'Each message must be an object.')
  }

  const { role, content } = value
  if (role !== 'user' && role !== 'assistant') {
    throw new AdminAiError('BAD_REQUEST', 'Unsupported message role.')
  }
  if (typeof content !== 'string' || content.trim().length === 0 || content.length > 8000) {
    throw new AdminAiError('BAD_REQUEST', 'Message content is required and must be under 8000 characters.')
  }

  return { role, content: content.trim(), attachmentIds: parseAttachmentIds(value.attachmentIds) }
}

export function parseAdminAiChatRequest(value: unknown): AdminAiChatRequest {
  if (!isRecord(value)) {
    throw new AdminAiError('BAD_REQUEST', 'Request body must be an object.')
  }

  const profileId = typeof value.profileId === 'string' && value.profileId.trim() ? value.profileId.trim() : undefined
  const model = typeof value.model === 'string' && value.model.trim() ? value.model.trim() : undefined
  const sessionId = typeof value.sessionId === 'string' && value.sessionId.trim() ? value.sessionId.trim() : undefined
  const rawMessages = Array.isArray(value.messages) ? value.messages : null

  if (!rawMessages || rawMessages.length === 0 || rawMessages.length > 30) {
    throw new AdminAiError('BAD_REQUEST', 'Messages must contain 1-30 entries.')
  }

  return {
    profileId,
    model,
    sessionId,
    messages: rawMessages.map(parseMessage),
  }
}
