import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: { vi: 'Sản phẩm', en: 'Product' },
    plural: { vi: 'Sản phẩm', en: 'Products' },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'priceVND', 'status'],
    description: { vi: 'Quản lý sản phẩm số', en: 'Manage digital products' },
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
      label: { vi: 'Tên sản phẩm', en: 'Name' },
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
      type: 'richText',
      localized: true,
      label: { vi: 'Mô tả', en: 'Description' },
      admin: {
        description: {
          vi: 'Mô tả chi tiết sản phẩm. Có thể chèn ảnh inline cho ảnh giải thích hoặc hướng dẫn.',
          en: 'Detailed product description. Inline images can be used for explanatory or instructional media.',
        },
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
      label: { vi: 'Mô tả ngắn', en: 'Excerpt' },
    },
    {
      name: 'type',
      type: 'select',
      label: { vi: 'Loại', en: 'Type' },
      options: [
        { label: { vi: 'Ebook', en: 'Ebook' }, value: 'ebook' },
        { label: { vi: 'Mẫu (Template)', en: 'Template' }, value: 'template' },
        { label: { vi: 'Mã nguồn', en: 'Code' }, value: 'code' },
      ],
      required: true,
      admin: {
        components: {
          Cell: '@/admin/components/cells/type-cell#TypeCell',
        },
      },
    },
    {
      name: 'priceUSD',
      type: 'number',
      required: true,
      min: 0,
      label: { vi: 'Giá (USD cents)', en: 'Price (USD cents)' },
      admin: {
        description: {
          vi: 'Giá tính bằng cents USD (ví dụ: 999 = $9.99)',
          en: 'Price in USD cents (e.g., 999 = $9.99)',
        },
      },
    },
    {
      name: 'priceVND',
      type: 'number',
      required: true,
      min: 0,
      label: { vi: 'Giá (VND)', en: 'Price (VND)' },
      admin: {
        description: {
          vi: 'Giá tính bằng VND (ví dụ: 250000 = 250.000₫)',
          en: 'Price in VND (e.g., 250000 = 250,000₫)',
        },
        components: {
          Cell: '@/admin/components/cells/price-vnd-cell#PriceVNDCell',
        },
      },
    },
    {
      name: 'images',
      type: 'array',
      label: { vi: 'Hình ảnh', en: 'Images' },
      labels: {
        singular: { vi: 'Hình ảnh', en: 'Image' },
        plural: { vi: 'Hình ảnh', en: 'Images' },
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: { vi: 'Hình ảnh', en: 'Image' },
        },
      ],
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
      label: { vi: 'Danh mục', en: 'Category' },
      filterOptions: {
        type: { equals: 'product' },
      },
    },
    {
      name: 'downloadFile',
      type: 'upload',
      relationTo: 'digital-downloads',
      label: { vi: 'File tải xuống', en: 'Download file' },
      admin: {
        description: {
          vi: 'File số mà khách hàng sẽ tải về sau khi mua',
          en: 'The digital file customers will download after purchase',
        },
      },
    },
    {
      name: 'previewImages',
      type: 'array',
      label: { vi: 'Hình ảnh xem trước', en: 'Preview images' },
      labels: {
        singular: { vi: 'Hình ảnh xem trước', en: 'Preview image' },
        plural: { vi: 'Hình ảnh xem trước', en: 'Preview images' },
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: { vi: 'Hình ảnh', en: 'Image' },
        },
      ],
    },
    {
      name: 'features',
      type: 'array',
      localized: true,
      label: { vi: 'Tính năng', en: 'Features' },
      labels: {
        singular: { vi: 'Tính năng', en: 'Feature' },
        plural: { vi: 'Tính năng', en: 'Features' },
      },
      fields: [
        {
          name: 'feature',
          type: 'text',
          label: { vi: 'Tính năng', en: 'Feature' },
        },
      ],
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
      name: 'stripeProductId',
      type: 'text',
      label: { vi: 'Stripe Product ID', en: 'Stripe product ID' },
      admin: {
        position: 'sidebar',
        description: {
          vi: 'ID sản phẩm Stripe dùng để thanh toán',
          en: 'Stripe Product ID for payment',
        },
      },
    },
    {
      name: 'stripePriceId',
      type: 'text',
      label: { vi: 'Stripe Price ID', en: 'Stripe price ID' },
      admin: {
        position: 'sidebar',
        description: {
          vi: 'ID giá Stripe',
          en: 'Stripe Price ID',
        },
      },
    },
    {
      name: 'problemSolved',
      type: 'textarea',
      localized: true,
      label: { vi: 'Vấn đề giải quyết', en: 'Problem solved' },
      admin: {
        description: {
          vi: 'Sản phẩm này giải quyết vấn đề gì? (1-2 câu)',
          en: 'What problem does this product solve? (1-2 sentences)',
        },
      },
    },
    {
      name: 'technologies',
      type: 'array',
      label: { vi: 'Công nghệ', en: 'Technologies' },
      labels: {
        singular: { vi: 'Công nghệ', en: 'Technology' },
        plural: { vi: 'Công nghệ', en: 'Technologies' },
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: { vi: 'Tên', en: 'Name' },
        },
        {
          name: 'category',
          type: 'select',
          label: { vi: 'Nhóm', en: 'Category' },
          options: [
            { label: { vi: 'Frontend', en: 'Frontend' }, value: 'frontend' },
            { label: { vi: 'Backend', en: 'Backend' }, value: 'backend' },
            { label: { vi: 'Cơ sở dữ liệu', en: 'Database' }, value: 'database' },
            { label: { vi: 'DevOps', en: 'DevOps' }, value: 'devops' },
            { label: { vi: 'AI/ML', en: 'AI/ML' }, value: 'ai' },
            { label: { vi: 'Khác', en: 'Other' }, value: 'other' },
          ],
        },
      ],
    },
    {
      name: 'keyFeatures',
      type: 'array',
      label: { vi: 'Tính năng nổi bật', en: 'Key features' },
      labels: {
        singular: { vi: 'Tính năng', en: 'Feature' },
        plural: { vi: 'Tính năng nổi bật', en: 'Key features' },
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
          name: 'description',
          type: 'textarea',
          localized: true,
          label: { vi: 'Mô tả', en: 'Description' },
        },
      ],
    },
  ],
}
