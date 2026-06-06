import { AdminAiError, type AdminAiSessionDetail, type AdminAiSessionMessage } from './admin-ai-chat-contract'

type PayloadSessionClient = {
  create: (args: { collection: string; data: Record<string, unknown>; [key: string]: unknown }) => Promise<unknown>
  delete: (args: { collection: string; id: string; [key: string]: unknown }) => Promise<unknown>
  find: (args: { collection: string; [key: string]: unknown }) => Promise<{ docs?: unknown[] }>
  findByID: (args: { collection: string; id: string; [key: string]: unknown }) => Promise<unknown>
  update: (args: { collection: string; id: string; data: Record<string, unknown>; [key: string]: unknown }) => Promise<unknown>
}

type SessionRecord = {
  id?: string | number
  title?: unknown
  adminUserId?: unknown
  adminUserEmail?: unknown
  profileId?: unknown
  model?: unknown
  messages?: unknown
  lastMessageAt?: unknown
  updatedAt?: unknown
  createdAt?: unknown
}

type AppendArgs = {
  sessionId?: string
  profileId?: string
  model?: string
  userMessage: AdminAiSessionMessage
  assistantMessage: AdminAiSessionMessage
}

function getAdminField(user: unknown, key: 'id' | 'email') {
  if (!user || typeof user !== 'object') return ''
  const value = (user as Record<string, unknown>)[key]
  return typeof value === 'string' || typeof value === 'number' ? String(value) : ''
}

function asSession(doc: unknown): SessionRecord {
  return doc && typeof doc === 'object' ? (doc as SessionRecord) : {}
}

function getMessages(value: unknown): AdminAiSessionMessage[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item, index) => {
      if (!item || typeof item !== 'object') return []
      const message = item as Record<string, unknown>
      const role = message.role === 'user' || message.role === 'assistant' ? message.role : null
      if (!role || typeof message.body !== 'string') return []
      return [{
        id: typeof message.id === 'string' ? message.id : `${role}-${Date.now()}-${index}`,
        role,
        body: message.body,
        createdAt: typeof message.createdAt === 'string' ? message.createdAt : new Date().toISOString(),
        status: message.status === 'read' || message.status === 'pending-write' ? message.status : undefined,
        attachments: Array.isArray(message.attachments) ? message.attachments as AdminAiSessionMessage['attachments'] : undefined,
        pendingActions: Array.isArray(message.pendingActions) ? message.pendingActions as AdminAiSessionMessage['pendingActions'] : undefined,
        toolResults: Array.isArray(message.toolResults) ? message.toolResults as AdminAiSessionMessage['toolResults'] : undefined,
      }]
    })
}

function createSessionTitle(message: string) {
  const compact = message.replace(/\s+/g, ' ').trim()
  if (!compact) return 'AI session'
  return compact.length > 72 ? `${compact.slice(0, 69)}...` : compact
}

function toSessionDetail(doc: unknown): AdminAiSessionDetail {
  const session = asSession(doc)
  const messages = getMessages(session.messages)
  return {
    id: String(session.id ?? ''),
    title: String(session.title ?? 'AI session'),
    adminUserEmail: typeof session.adminUserEmail === 'string' ? session.adminUserEmail : undefined,
    profileId: typeof session.profileId === 'string' ? session.profileId : undefined,
    model: typeof session.model === 'string' ? session.model : undefined,
    messages,
    messageCount: messages.length,
    lastMessageAt: String(session.lastMessageAt ?? session.updatedAt ?? session.createdAt ?? ''),
    updatedAt: String(session.updatedAt ?? ''),
    createdAt: String(session.createdAt ?? ''),
  }
}

function assertSessionOwner(doc: unknown, adminUser: unknown) {
  const session = asSession(doc)
  if (!session.id) throw new AdminAiError('BAD_REQUEST', 'AI session not found.', 404)
  if (String(session.adminUserId ?? '') !== getAdminField(adminUser, 'id')) {
    throw new AdminAiError('UNAUTHORIZED', 'AI session belongs to another admin.', 403)
  }
  return session
}

async function findSessionById(payload: PayloadSessionClient, id: string) {
  try {
    return await payload.findByID({ collection: 'admin-ai-sessions', id, depth: 0 })
  } catch {
    throw new AdminAiError('BAD_REQUEST', 'AI session not found.', 404)
  }
}

export async function listAdminAiSessions(payload: PayloadSessionClient, adminUser: unknown) {
  const result = await payload.find({
    collection: 'admin-ai-sessions',
    limit: 50,
    sort: '-lastMessageAt',
    where: { adminUserId: { equals: getAdminField(adminUser, 'id') } },
  })
  return (result.docs ?? []).map(toSessionDetail)
}

export async function getAdminAiSession(payload: PayloadSessionClient, adminUser: unknown, id: string) {
  const doc = await findSessionById(payload, id)
  assertSessionOwner(doc, adminUser)
  return toSessionDetail(doc)
}

export async function deleteAdminAiSession(payload: PayloadSessionClient, adminUser: unknown, id: string) {
  await getAdminAiSession(payload, adminUser, id)
  await payload.delete({ collection: 'admin-ai-sessions', id })
  return { ok: true }
}

export async function replaceAdminAiSessionMessages(
  payload: PayloadSessionClient,
  adminUser: unknown,
  id: string,
  messages: unknown,
) {
  await getAdminAiSession(payload, adminUser, id)
  const doc = await payload.update({
    collection: 'admin-ai-sessions',
    id,
    data: {
      messages: getMessages(messages),
      lastMessageAt: new Date().toISOString(),
    },
  })
  return toSessionDetail(doc)
}

export async function createAdminAiSession(payload: PayloadSessionClient, adminUser: unknown) {
  const now = new Date().toISOString()
  const doc = await payload.create({
    collection: 'admin-ai-sessions',
    data: {
      title: 'New AI session',
      adminUserId: getAdminField(adminUser, 'id'),
      adminUserEmail: getAdminField(adminUser, 'email') || undefined,
      messages: [],
      lastMessageAt: now,
    },
  })
  return toSessionDetail(doc)
}

export async function appendAdminAiSessionTurn(
  payload: PayloadSessionClient,
  adminUser: unknown,
  args: AppendArgs,
) {
  const now = new Date().toISOString()
  if (!args.sessionId) {
    const doc = await payload.create({
      collection: 'admin-ai-sessions',
      data: {
        title: createSessionTitle(args.userMessage.body),
        adminUserId: getAdminField(adminUser, 'id'),
        adminUserEmail: getAdminField(adminUser, 'email') || undefined,
        profileId: args.profileId,
        model: args.model,
        messages: [args.userMessage, args.assistantMessage],
        lastMessageAt: now,
      },
    })
    return toSessionDetail(doc)
  }

  const current = await findSessionById(payload, args.sessionId)
  assertSessionOwner(current, adminUser)
  const currentSession = asSession(current)
  const currentMessages = getMessages(currentSession.messages)
  const messages = [...currentMessages, args.userMessage, args.assistantMessage]
  const doc = await payload.update({
    collection: 'admin-ai-sessions',
    id: args.sessionId,
    data: {
      title: currentMessages.length && typeof currentSession.title === 'string'
        ? currentSession.title
        : createSessionTitle(args.userMessage.body),
      profileId: args.profileId,
      model: args.model,
      messages,
      lastMessageAt: now,
    },
  })
  return toSessionDetail(doc)
}
