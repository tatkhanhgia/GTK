import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: { vi: 'Người dùng', en: 'User' },
    plural: { vi: 'Người dùng', en: 'Users' },
  },
  admin: {
    useAsTitle: 'email',
    description: {
      vi: 'Tài khoản quản trị Payload CMS',
      en: 'Payload CMS admin accounts',
    },
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: { vi: 'Họ và tên', en: 'Name' },
    },
    {
      name: 'role',
      type: 'select',
      label: { vi: 'Vai trò', en: 'Role' },
      options: [
        { label: { vi: 'Quản trị viên', en: 'Admin' }, value: 'admin' },
        { label: { vi: 'Biên tập viên', en: 'Editor' }, value: 'editor' },
      ],
      defaultValue: 'editor',
      required: true,
    },
  ],
}
