import type { GlobalConfig } from 'payload'

export const AuthorProfile: GlobalConfig = {
  slug: 'author-profile',
  label: 'Author Profile',
  access: {
    read: () => true,
    update: ({ req }) => !!req.user,
  },
  admin: {
    description: 'Personal info displayed on the /me page',
  },
  fields: [
    // --- Identity ---
    { name: 'name', type: 'text', required: true },
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'bio',
      type: 'richText',
      localized: true,
    },
    // --- Me Page Editorial Content ---
    {
      name: 'meEditorial',
      type: 'group',
      fields: [
        {
          name: 'heroSentence',
          type: 'text',
          localized: true,
        },
        {
          name: 'buildingNow',
          type: 'richText',
          localized: true,
        },
        {
          name: 'principles',
          type: 'array',
          labels: { singular: 'Principle', plural: 'Principles' },
          fields: [
            { name: 'title', type: 'text', required: true, localized: true },
            { name: 'description', type: 'text', required: true, localized: true },
          ],
        },
        {
          name: 'selectedWriting',
          type: 'array',
          labels: { singular: 'Writing', plural: 'Selected Writing' },
          fields: [
            {
              name: 'post',
              type: 'relationship',
              relationTo: 'posts',
              required: true,
            },
            {
              name: 'note',
              type: 'text',
              localized: true,
            },
          ],
        },
        {
          name: 'timelineContext',
          type: 'text',
          localized: true,
        },
        {
          name: 'contactCtaText',
          type: 'text',
          localized: true,
        },
      ],
    },
    // --- Social Links ---
    {
      name: 'socialLinks',
      type: 'array',
      labels: { singular: 'Social Link', plural: 'Social Links' },
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          options: [
            { label: 'GitHub', value: 'github' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'X (Twitter)', value: 'x' },
            { label: 'Facebook', value: 'facebook' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'Email', value: 'email' },
          ],
        },
        { name: 'url', type: 'text', required: true },
      ],
    },
    // --- Skills ---
    {
      name: 'skills',
      type: 'array',
      labels: { singular: 'Skill Category', plural: 'Skill Categories' },
      fields: [
        { name: 'category', type: 'text', required: true },
        {
          name: 'items',
          type: 'array',
          labels: { singular: 'Skill', plural: 'Skills' },
          fields: [
            { name: 'name', type: 'text', required: true },
          ],
        },
      ],
    },
    // --- Timeline ---
    {
      name: 'timeline',
      type: 'array',
      labels: { singular: 'Entry', plural: 'Timeline' },
      fields: [
        { name: 'year', type: 'text', required: true },
        { name: 'title', type: 'text', required: true, localized: true },
        { name: 'description', type: 'text', localized: true },
        {
          name: 'type',
          type: 'select',
          defaultValue: 'work',
          options: [
            { label: 'Work', value: 'work' },
            { label: 'Education', value: 'education' },
            { label: 'Project', value: 'project' },
            { label: 'Milestone', value: 'milestone' },
          ],
        },
      ],
    },
    // --- Contact ---
    {
      name: 'contactEmail',
      type: 'email',
      access: { read: ({ req }) => !!req.user },
      admin: { description: 'Email address that receives contact form submissions' },
    },
    // --- SEO ---
    {
      name: 'meta',
      type: 'group',
      fields: [
        { name: 'metaTitle', type: 'text', localized: true },
        { name: 'metaDescription', type: 'textarea', localized: true },
      ],
    },
  ],
}
