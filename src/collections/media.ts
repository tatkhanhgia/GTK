import type { CollectionConfig } from 'payload'
import { isPayloadAdminUser } from '@/lib/admin/payload-admin-access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: { vi: 'Media', en: 'Media' },
    plural: { vi: 'Media', en: 'Media' },
  },
  access: {
    // Media assets are referenced by public pages (thumbnails, hero images,
    // inline article images), so anonymous read access is required for the
    // upload file endpoint (/api/media/file/:filename) and the REST read API.
    read: () => true,
    create: ({ req }) => isPayloadAdminUser(req.user),
    update: ({ req }) => isPayloadAdminUser(req.user),
    delete: ({ req }) => isPayloadAdminUser(req.user),
  },
  admin: {
    description: {
      vi: 'Thư viện hình ảnh và tệp tải lên',
      en: 'Image library and uploaded assets',
    },
  },
  upload: {
    staticDir: 'public/media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 432,
        position: 'centre',
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: { vi: 'Văn bản thay thế (alt)', en: 'Alt text' },
    },
    {
      name: 'caption',
      type: 'text',
      label: { vi: 'Chú thích', en: 'Caption' },
    },
  ],
}
