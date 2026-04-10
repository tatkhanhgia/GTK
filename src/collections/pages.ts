import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: { vi: 'Trang', en: 'Page' },
    plural: { vi: 'Trang', en: 'Pages' },
  },
  admin: {
    useAsTitle: 'title',
    description: { vi: 'Quản lý trang tĩnh', en: 'Manage static pages' },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: { vi: 'Tiêu đề', en: 'Title' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: { vi: 'Đường dẫn', en: 'Slug' },
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
      label: { vi: 'Nội dung', en: 'Content' },
      admin: {
        description: {
          vi: 'Nội dung trang (hỗ trợ định dạng rich text)',
          en: 'Page content (rich text with formatting support)',
        },
      },
    },
    {
      name: 'seoTitle',
      type: 'text',
      localized: true,
      label: { vi: 'Tiêu đề SEO', en: 'SEO title' },
    },
    {
      name: 'seoDescription',
      type: 'textarea',
      localized: true,
      label: { vi: 'Mô tả SEO', en: 'SEO description' },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      label: { vi: 'Ảnh hero', en: 'Hero image' },
      admin: {
        description: {
          vi: 'Ảnh hero tùy chọn dùng cho trang chủ',
          en: 'Optional hero image for homepage',
        },
      },
    },
  ],
}
