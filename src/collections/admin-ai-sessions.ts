import type { CollectionConfig } from 'payload'
import { isPayloadAdminUser } from '../lib/admin/payload-admin-access'

function ownSessionAccess(user: unknown) {
  if (!isPayloadAdminUser(user)) return false
  const id = user && typeof user === 'object' ? (user as { id?: unknown }).id : null
  return { adminUserId: { equals: String(id ?? '') } }
}

export const AdminAiSessions: CollectionConfig = {
  slug: 'admin-ai-sessions',
  labels: {
    singular: { vi: 'AI chat session', en: 'AI chat session' },
    plural: { vi: 'AI chat sessions', en: 'AI chat sessions' },
  },
  admin: {
    useAsTitle: 'title',
    group: { vi: 'He thong', en: 'System' },
    defaultColumns: ['title', 'adminUserEmail', 'model', 'lastMessageAt'],
    description: {
      vi: 'Lich su phien chat cua AI Ops Console.',
      en: 'AI Ops Console chat session history.',
    },
  },
  access: {
    create: ({ req }) => isPayloadAdminUser(req.user),
    read: ({ req }) => ownSessionAccess(req.user),
    update: ({ req }) => ownSessionAccess(req.user),
    delete: ({ req }) => ownSessionAccess(req.user),
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'adminUserId', type: 'text', required: true },
    { name: 'adminUserEmail', type: 'email' },
    { name: 'profileId', type: 'text' },
    { name: 'model', type: 'text' },
    { name: 'messages', type: 'json', required: true },
    { name: 'lastMessageAt', type: 'date', required: true },
  ],
}
