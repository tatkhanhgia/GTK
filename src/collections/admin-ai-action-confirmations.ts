import type { CollectionConfig } from 'payload'
import { isPayloadAdminUser } from '../lib/admin/payload-admin-access'

export const AdminAiActionConfirmations: CollectionConfig = {
  slug: 'admin-ai-action-confirmations',
  labels: {
    singular: { vi: 'AI action confirmation', en: 'AI action confirmation' },
    plural: { vi: 'AI action confirmations', en: 'AI action confirmations' },
  },
  admin: {
    group: { vi: 'He thong', en: 'System' },
    hidden: true,
    defaultColumns: ['toolName', 'status', 'adminUserId', 'expiresAt'],
  },
  access: {
    create: ({ req }) => isPayloadAdminUser(req.user),
    read: ({ req }) => isPayloadAdminUser(req.user),
    update: ({ req }) => isPayloadAdminUser(req.user),
    delete: ({ req }) => isPayloadAdminUser(req.user),
  },
  fields: [
    { name: 'toolName', type: 'text', required: true },
    { name: 'status', type: 'select', required: true, defaultValue: 'pending', options: ['pending', 'executing', 'executed', 'cancelled', 'expired'] },
    { name: 'adminUserId', type: 'text', required: true },
    { name: 'adminUserEmail', type: 'email' },
    { name: 'input', type: 'json', required: true },
    { name: 'summary', type: 'textarea', required: true },
    { name: 'expiresAt', type: 'date', required: true },
    { name: 'executedAt', type: 'date' },
    { name: 'cancelledAt', type: 'date' },
    { name: 'result', type: 'json' },
  ],
}
