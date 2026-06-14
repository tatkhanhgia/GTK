import type { CollectionConfig } from 'payload'
import { assertRichTextMediaQuality } from '../lib/content/rich-text-media-quality'
import { publishedNowWhere } from '../lib/content/publication-state'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: { vi: 'Trang', en: 'Page' },
    plural: { vi: 'Trang', en: 'Pages' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'publishedAt'],
    description: { vi: 'Quản lý trang tĩnh', en: 'Manage static pages' },
    preview: (doc, { locale }) => {
      const slug = typeof doc?.slug === 'string' ? doc.slug : ''
      return slug ? `${SITE_URL}/${locale === 'en' ? 'en' : 'vi'}/${slug}?preview=1` : null
    },
  },
  access: {
    read: ({ req }) => req.user ? true : publishedNowWhere(),
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
          vi: 'Nội dung trang. Dùng ảnh inline khi ảnh là một phần của nội dung, không phải hero.',
          en: 'Page content. Use inline images when the image is part of the page body, not the hero.',
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
          vi: 'Ảnh hero tùy chọn cho phần đầu trang. Ảnh trong nội dung nên chèn trực tiếp vào rich text.',
          en: 'Optional hero image for the page header. Body images should be inserted directly into rich text.',
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      label: { vi: 'Trạng thái', en: 'Status' },
      options: [
        { label: { vi: 'Nháp', en: 'Draft' }, value: 'draft' },
        { label: { vi: 'Đã xuất bản', en: 'Published' }, value: 'published' },
      ],
      defaultValue: 'draft',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: { vi: 'Thời gian xuất bản', en: 'Published at' },
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        const content = data.content ?? originalDoc?.content
        if (data.status === 'published') {
          assertRichTextMediaQuality(content)
        }
        return data
      },
    ],
  },
}
