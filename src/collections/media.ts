import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: { vi: 'Media', en: 'Media' },
    plural: { vi: 'Media', en: 'Media' },
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
