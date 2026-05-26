import type { CollectionConfig } from 'payload'
import { isPayloadAdminUser } from '../lib/admin/payload-admin-access'

function ownReferenceAccess(user: unknown) {
  if (!isPayloadAdminUser(user)) return false
  const id = user && typeof user === 'object' ? (user as { id?: unknown }).id : null
  return { adminUserId: { equals: String(id ?? '') } }
}

export const AdminAiFileReferences: CollectionConfig = {
  slug: 'admin-ai-file-references',
  labels: {
    singular: { vi: 'AI file reference', en: 'AI file reference' },
    plural: { vi: 'AI file references', en: 'AI file references' },
  },
  admin: {
    group: { vi: 'He thong', en: 'System' },
    hidden: true,
    defaultColumns: ['displayName', 'adminUserEmail', 'sessionId', 'deletedAt'],
  },
  access: {
    create: ({ req }) => isPayloadAdminUser(req.user),
    read: ({ req }) => ownReferenceAccess(req.user),
    update: ({ req }) => ownReferenceAccess(req.user),
    delete: ({ req }) => ownReferenceAccess(req.user),
  },
  fields: [
    { name: 'file', type: 'relationship', relationTo: 'admin-ai-files', required: true },
    { name: 'adminUserId', type: 'text', required: true },
    { name: 'adminUserEmail', type: 'email' },
    { name: 'sessionId', type: 'text' },
    { name: 'displayName', type: 'text', required: true },
    { name: 'deletedAt', type: 'date' },
  ],
}
