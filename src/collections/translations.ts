import type { CollectionConfig } from 'payload'

export const Translations: CollectionConfig = {
  slug: 'translations',
  labels: {
    singular: { vi: 'Bản dịch', en: 'Translation' },
    plural: { vi: 'Bản dịch', en: 'Translations' },
  },
  admin: {
    useAsTitle: 'key',
    defaultColumns: ['key', 'group', 'vi', 'en'],
    description: {
      vi: 'Quản lý chuỗi dịch cho toàn bộ giao diện',
      en: 'Manage UI translation strings across the site and admin',
    },
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: { vi: 'Khóa', en: 'Key' },
      admin: {
        description: {
          vi: 'Định danh duy nhất dạng dấu chấm, ví dụ: nav.home',
          en: 'Unique dotted identifier, e.g. nav.home',
        },
      },
    },
    {
      name: 'vi',
      type: 'text',
      required: true,
      label: { vi: 'Tiếng Việt', en: 'Vietnamese' },
    },
    {
      name: 'en',
      type: 'text',
      required: true,
      label: { vi: 'Tiếng Anh', en: 'English' },
    },
    {
      name: 'context',
      type: 'text',
      label: { vi: 'Ngữ cảnh', en: 'Context' },
      admin: {
        description: {
          vi: 'Ghi chú ngắn về nơi chuỗi này được sử dụng',
          en: 'Short note about where this string appears',
        },
      },
    },
    {
      name: 'group',
      type: 'text',
      label: { vi: 'Nhóm', en: 'Group' },
      admin: {
        description: {
          vi: 'Dùng để lọc danh sách, ví dụ: nav, customHeader',
          en: 'Used to filter list view, e.g. nav, customHeader',
        },
      },
    },
  ],
}
