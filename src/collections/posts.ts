import type { CollectionConfig } from 'payload'

// Walk a Lexical rich-text tree and collect only the actual text content
// from text nodes. Skips structural metadata (type, format, version, ...)
// and nested children recursively. Returns a single space-separated string.
function extractLexicalText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const n = node as { text?: unknown; children?: unknown[]; root?: unknown }
  if (n.root) return extractLexicalText(n.root)
  let out = ''
  if (typeof n.text === 'string') out += n.text + ' '
  if (Array.isArray(n.children)) {
    for (const child of n.children) out += extractLexicalText(child)
  }
  return out
}

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: { vi: 'Bài viết', en: 'Post' },
    plural: { vi: 'Bài viết', en: 'Posts' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'publishedAt', 'category'],
    description: { vi: 'Quản lý bài viết blog', en: 'Manage blog posts' },
  },
  versions: {
    drafts: {
      autosave: true,
    },
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true
      return {
        status: { equals: 'published' },
      }
    },
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
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
      label: { vi: 'Mô tả ngắn', en: 'Excerpt' },
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
      required: true,
      label: { vi: 'Nội dung', en: 'Content' },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: { vi: 'Ảnh đại diện', en: 'Featured image' },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
      label: { vi: 'Danh mục', en: 'Category' },
      filterOptions: {
        type: { equals: 'blog' },
      },
    },
    {
      name: 'tags',
      type: 'array',
      label: { vi: 'Thẻ', en: 'Tags' },
      labels: {
        singular: { vi: 'Thẻ', en: 'Tag' },
        plural: { vi: 'Thẻ', en: 'Tags' },
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
          label: { vi: 'Thẻ', en: 'Tag' },
        },
      ],
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      hasMany: false,
      label: { vi: 'Tác giả', en: 'Author' },
      admin: {
        position: 'sidebar',
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
      admin: {
        position: 'sidebar',
        components: {
          Cell: '@/admin/components/cells/status-cell#StatusCell',
        },
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: { vi: 'Thời gian xuất bản', en: 'Published at' },
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'readingTime',
      type: 'number',
      label: { vi: 'Thời gian đọc', en: 'Reading time' },
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: {
          vi: 'Thời gian đọc ước tính (phút)',
          en: 'Estimated reading time in minutes',
        },
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-calculate reading time from richtext content. Walk the
        // Lexical tree and count only real text (not JSON metadata).
        // 200 wpm is the standard average adult silent reading speed.
        if (data.content) {
          const plain = extractLexicalText(data.content).trim()
          const wordCount = plain ? plain.split(/\s+/).length : 0
          data.readingTime = Math.max(1, Math.ceil(wordCount / 200))
        }
        return data
      },
    ],
  },
}
