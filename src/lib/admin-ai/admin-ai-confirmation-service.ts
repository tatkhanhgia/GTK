import { AdminAiError, type AdminAiPendingAction } from './admin-ai-chat-contract'
import { executeConfirmedAdminAiTool } from './admin-ai-tool-registry'
import { writeAdminAiAuditLog } from './admin-ai-audit-log-service'
import type { Where } from 'payload'

const CONFIRMATION_TTL_MS = 10 * 60 * 1000
const inProcessConfirmationLocks = new Set<string>()

type PayloadConfirmationClient = {
  create: (args: { collection: string; data: Record<string, unknown>; [key: string]: unknown }) => Promise<unknown>
  find: (args: { collection: string; [key: string]: unknown }) => Promise<{ docs?: unknown[] }>
  findByID: (args: { collection: string; id: string; [key: string]: unknown }) => Promise<unknown>
  update: {
    (args: { collection: string; id: string; data: Record<string, unknown>; [key: string]: unknown }): Promise<unknown>
    (args: { collection: string; where: Where; data: Record<string, unknown>; [key: string]: unknown }): Promise<{ docs?: unknown[] }>
  }
}

type ConfirmationRecord = {
  id?: string | number
  toolName?: unknown
  status?: unknown
  adminUserId?: unknown
  input?: unknown
  expiresAt?: unknown
}

function getAdminField(user: unknown, key: 'id' | 'email') {
  if (!user || typeof user !== 'object') return ''
  const value = (user as Record<string, unknown>)[key]
  return typeof value === 'string' || typeof value === 'number' ? String(value) : ''
}

function asConfirmation(doc: unknown): ConfirmationRecord {
  return doc && typeof doc === 'object' ? (doc as ConfirmationRecord) : {}
}

function toPendingAction(doc: unknown, fallbackSummary: string): AdminAiPendingAction {
  const confirmation = asConfirmation(doc)
  return {
    id: String(confirmation.id ?? ''),
    toolName: String(confirmation.toolName ?? ''),
    summary: fallbackSummary,
    expiresAt: String(confirmation.expiresAt ?? ''),
  }
}

function getUpdatedDocs(result: unknown) {
  if (!result || typeof result !== 'object') return []
  const docs = (result as { docs?: unknown[] }).docs
  return Array.isArray(docs) ? docs : []
}

export async function createAdminAiActionConfirmation(
  payload: PayloadConfirmationClient,
  adminUser: unknown,
  toolName: string,
  input: unknown,
  summary: string,
) {
  const doc = await payload.create({
    collection: 'admin-ai-action-confirmations',
    data: {
      toolName,
      status: 'pending',
      adminUserId: getAdminField(adminUser, 'id'),
      adminUserEmail: getAdminField(adminUser, 'email') || undefined,
      input,
      summary,
      expiresAt: new Date(Date.now() + CONFIRMATION_TTL_MS).toISOString(),
    },
  })
  await writeAdminAiAuditLog(payload, { event: 'confirmation_created', toolName, adminUser, input })
  return toPendingAction(doc, summary)
}

export async function confirmAdminAiAction(payload: PayloadConfirmationClient, adminUser: unknown, id: string) {
  if (inProcessConfirmationLocks.has(id)) {
    throw new AdminAiError('BAD_REQUEST', 'Action is already executing.', 409)
  }

  inProcessConfirmationLocks.add(id)
  try {
    const doc = asConfirmation(await payload.findByID({ collection: 'admin-ai-action-confirmations', id }))
    const toolName = typeof doc.toolName === 'string' ? doc.toolName : ''
    const adminUserId = getAdminField(adminUser, 'id')

    if (!toolName || doc.status !== 'pending') {
      throw new AdminAiError('BAD_REQUEST', 'Action is not pending.', 409)
    }
    if (String(doc.adminUserId ?? '') !== adminUserId) {
      throw new AdminAiError('UNAUTHORIZED', 'Action belongs to another admin session.', 403)
    }
    if (new Date(String(doc.expiresAt)).getTime() <= Date.now()) {
      await payload.update({ collection: 'admin-ai-action-confirmations', id, data: { status: 'expired' } })
      throw new AdminAiError('BAD_REQUEST', 'Action confirmation expired.', 410)
    }

    const claim = await payload.update({
      collection: 'admin-ai-action-confirmations',
      where: {
        and: [
          { id: { equals: id } },
          { status: { equals: 'pending' } },
        ],
      },
      data: { status: 'executing' },
    })
    if (getUpdatedDocs(claim).length === 0) {
      throw new AdminAiError('BAD_REQUEST', 'Action is already executing.', 409)
    }
    const result = await executeConfirmedAdminAiTool(payload, toolName, doc.input)
    await payload.update({
      collection: 'admin-ai-action-confirmations',
      id,
      data: { status: 'executed', executedAt: new Date().toISOString(), result },
    })
    await writeAdminAiAuditLog(payload, { event: 'confirmation_executed', toolName, adminUser, input: doc.input, result })
    return result
  } finally {
    inProcessConfirmationLocks.delete(id)
  }
}

export async function cancelAdminAiAction(payload: PayloadConfirmationClient, adminUser: unknown, id: string) {
  const doc = asConfirmation(await payload.findByID({ collection: 'admin-ai-action-confirmations', id }))
  if (doc.status !== 'pending') {
    throw new AdminAiError('BAD_REQUEST', 'Action is not pending.', 409)
  }
  if (String(doc.adminUserId ?? '') !== getAdminField(adminUser, 'id')) {
    throw new AdminAiError('UNAUTHORIZED', 'Action belongs to another admin session.', 403)
  }

  await payload.update({
    collection: 'admin-ai-action-confirmations',
    id,
    data: { status: 'cancelled', cancelledAt: new Date().toISOString() },
  })
  await writeAdminAiAuditLog(payload, { event: 'confirmation_cancelled', toolName: String(doc.toolName ?? ''), adminUser, input: doc.input })
  return { ok: true }
}
