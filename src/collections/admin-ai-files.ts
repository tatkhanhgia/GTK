import type { CollectionConfig } from 'payload'
import { isPayloadAdminUser } from '../lib/admin/payload-admin-access'

export const AdminAiFiles: CollectionConfig = {
  slug: 'admin-ai-files',
  labels: {
    singular: { vi: 'AI file', en: 'AI file' },
    plural: { vi: 'AI files', en: 'AI files' },
  },
  admin: {
    group: { vi: 'He thong', en: 'System' },
    hidden: true,
    defaultColumns: ['originalFilename', 'mimeType', 'byteSize', 'status', 'createdAt'],
  },
  access: {
    create: ({ req }) => isPayloadAdminUser(req.user),
    read: ({ req }) => isPayloadAdminUser(req.user),
    update: ({ req }) => isPayloadAdminUser(req.user),
    delete: ({ req }) => isPayloadAdminUser(req.user),
  },
  fields: [
    { name: 'checksum', type: 'text', required: true, unique: true },
    { name: 'originalFilename', type: 'text', required: true },
    { name: 'mimeType', type: 'text', required: true },
    { name: 'byteSize', type: 'number', required: true },
    { name: 'status', type: 'select', required: true, defaultValue: 'ready', options: ['processing', 'ready', 'failed'] },
    { name: 'deletedAt', type: 'date' },
  ],
}
