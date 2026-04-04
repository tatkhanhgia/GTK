import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'priceUSD', 'status'],
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
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Ebook', value: 'ebook' },
        { label: 'Template', value: 'template' },
        { label: 'Code', value: 'code' },
      ],
      required: true,
    },
    {
      name: 'priceUSD',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Price in USD cents (e.g., 999 = $9.99)',
      },
    },
    {
      name: 'priceVND',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Price in VND (e.g., 250000 = 250,000₫)',
      },
    },
    {
      name: 'images',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
      filterOptions: {
        type: { equals: 'product' },
      },
    },
    {
      name: 'downloadFile',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'The digital file customers will download after purchase',
      },
    },
    {
      name: 'previewImages',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'features',
      type: 'array',
      localized: true,
      fields: [
        {
          name: 'feature',
          type: 'text',
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      defaultValue: 'draft',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'stripeProductId',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Stripe Product ID for payment',
      },
    },
    {
      name: 'stripePriceId',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Stripe Price ID',
      },
    },
  ],
}
