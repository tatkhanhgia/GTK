import type { CollectionConfig } from 'payload'
import { isPayloadAdminUser } from '@/lib/admin/payload-admin-access'

const isSignedInAdminRequest = ({
  isReadingStaticFile,
  req,
}: {
  isReadingStaticFile?: boolean
  req: { user?: unknown }
}) => !isReadingStaticFile && isPayloadAdminUser(req.user)

export const DigitalDownloads: CollectionConfig = {
  slug: 'digital-downloads',
  access: {
    // Keep admin metadata readable, but never let Payload's file endpoint
    // serve paid binaries outside the token-gated download route.
    read: isSignedInAdminRequest,
    create: ({ req }) => isPayloadAdminUser(req.user),
    update: ({ req }) => isPayloadAdminUser(req.user),
    delete: ({ req }) => isPayloadAdminUser(req.user),
  },
  labels: {
    singular: { vi: 'Tep tai xuong', en: 'Digital download' },
    plural: { vi: 'Tep tai xuong', en: 'Digital downloads' },
  },
  admin: {
    useAsTitle: 'title',
    description: {
      vi: 'Kho tep san pham so danh cho khach hang da mua',
      en: 'Digital product files delivered to paying customers',
    },
  },
  upload: {
    staticDir: 'digital-downloads',
    handlers: [() => new Response('Not found', { status: 404 })],
    mimeTypes: [
      'application/pdf',
      'application/zip',
      'application/x-zip-compressed',
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/gif',
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: { vi: 'Tieu de', en: 'Title' },
    },
    {
      name: 'description',
      type: 'textarea',
      label: { vi: 'Mo ta', en: 'Description' },
    },
    {
      name: 'version',
      type: 'text',
      label: { vi: 'Phien ban', en: 'Version' },
      admin: {
        description: {
          vi: 'Vi du: v1.0.0 hoac 2026-05',
          en: 'Example: v1.0.0 or 2026-05',
        },
      },
    },
  ],
}
