import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: { vi: 'Danh mục', en: 'Category' },
    plural: { vi: 'Danh mục', en: 'Categories' },
  },
  admin: {
    useAsTitle: 'name',
    description: {
      vi: 'Danh mục dùng chung cho bài viết và sản phẩm',
      en: 'Shared categories for posts and products',
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      label: { vi: 'Tên', en: 'Name' },
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
      name: 'description',
      type: 'textarea',
      localized: true,
      label: { vi: 'Mô tả', en: 'Description' },
    },
    {
      name: 'type',
      type: 'select',
      label: { vi: 'Loại', en: 'Type' },
      options: [
        { label: { vi: 'Blog', en: 'Blog' }, value: 'blog' },
        { label: { vi: 'Sản phẩm', en: 'Product' }, value: 'product' },
      ],
      required: true,
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
      label: { vi: 'Danh mục cha', en: 'Parent category' },
    },
  ],
}
