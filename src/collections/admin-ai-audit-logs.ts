import type { CollectionConfig } from 'payload'
import { isPayloadAdminUser } from '../lib/admin/payload-admin-access'

export const AdminAiAuditLogs: CollectionConfig = {
  slug: 'admin-ai-audit-logs',
  labels: {
    singular: { vi: 'AI audit log', en: 'AI audit log' },
    plural: { vi: 'AI audit logs', en: 'AI audit logs' },
  },
  admin: {
    group: { vi: 'He thong', en: 'System' },
    hidden: true,
    defaultColumns: ['event', 'toolName', 'adminUserId', 'createdAt'],
  },
  access: {
    create: ({ req }) => isPayloadAdminUser(req.user),
    read: ({ req }) => isPayloadAdminUser(req.user),
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: 'event', type: 'text', required: true },
    { name: 'toolName', type: 'text' },
    { name: 'adminUserId', type: 'text' },
    { name: 'adminUserEmail', type: 'email' },
    { name: 'input', type: 'json' },
    { name: 'result', type: 'json' },
  ],
}
