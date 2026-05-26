import type { CollectionConfig } from 'payload'
import { isPayloadAdminUser } from '../lib/admin/payload-admin-access'

export const AdminAiFileChunks: CollectionConfig = {
  slug: 'admin-ai-file-chunks',
  labels: {
    singular: { vi: 'AI file chunk', en: 'AI file chunk' },
    plural: { vi: 'AI file chunks', en: 'AI file chunks' },
  },
  admin: {
    group: { vi: 'He thong', en: 'System' },
    hidden: true,
    defaultColumns: ['file', 'chunkIndex', 'charStart', 'charEnd'],
  },
  access: {
    create: ({ req }) => isPayloadAdminUser(req.user),
    read: ({ req }) => isPayloadAdminUser(req.user),
    update: ({ req }) => isPayloadAdminUser(req.user),
    delete: ({ req }) => isPayloadAdminUser(req.user),
  },
  fields: [
    { name: 'file', type: 'relationship', relationTo: 'admin-ai-files', required: true },
    { name: 'chunkIndex', type: 'number', required: true },
    { name: 'content', type: 'textarea', required: true },
    { name: 'charStart', type: 'number', required: true },
    { name: 'charEnd', type: 'number', required: true },
    { name: 'checksum', type: 'text', required: true },
  ],
}
