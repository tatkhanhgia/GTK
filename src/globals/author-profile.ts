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
    {
      type: 'tabs',
      tabs: [
        // --- Tab 1: Identity ---
        {
          label: 'Danh tính',
          description: 'Thông tin nhận diện cơ bản hiển thị trên trang /me.',
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'title', type: 'text', required: true, localized: true },
            {
              name: 'yearsOfExperience',
              type: 'number',
              min: 0,
              admin: { description: 'Years of professional experience (displayed in Quick Stats)' },
            },
            {
              name: 'projectsCompleted',
              type: 'number',
              min: 0,
              admin: { description: 'Number of projects completed (displayed in Quick Stats)' },
            },
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
          ],
        },
        // --- Tab 2: Editorial content (Me page) ---
        {
          label: 'Nội dung',
          description: 'Nội dung biên tập cho trang /me.',
          fields: [
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
          ],
        },
        // --- Tab 3: Skills & Timeline ---
        {
          label: 'Kỹ năng & Lịch sử',
          description: 'Bộ kỹ năng và timeline sự nghiệp.',
          fields: [
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
          ],
        },
        // --- Tab 4: Social, contact & philosophy ---
        {
          label: 'Liên hệ',
          description: 'Social links, email liên hệ, và personal philosophy.',
          fields: [
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
            {
              name: 'contactEmail',
              type: 'email',
              access: { read: ({ req }) => !!req.user },
              admin: { description: 'Email address that receives contact form submissions' },
            },
            {
              name: 'philosophy',
              type: 'group',
              label: 'Personal Philosophy',
              fields: [
                {
                  name: 'story',
                  type: 'richText',
                  localized: true,
                  label: 'My Story',
                  admin: {
                    description: 'Personal story/why I do this (shown on homepage)',
                  },
                },
                {
                  name: 'workingPrinciples',
                  type: 'array',
                  labels: { singular: 'Principle', plural: 'Working Principles' },
                  fields: [
                    { name: 'title', type: 'text', required: true, localized: true },
                    { name: 'description', type: 'textarea', required: true, localized: true },
                    {
                      name: 'icon',
                      type: 'select',
                      options: [
                        { label: 'Lightbulb', value: 'lightbulb' },
                        { label: 'Heart', value: 'heart' },
                        { label: 'Target', value: 'target' },
                        { label: 'Rocket', value: 'rocket' },
                      ],
                    },
                  ],
                },
                {
                  name: 'heroTagline',
                  type: 'text',
                  localized: true,
                  label: 'Hero Tagline',
                  admin: {
                    description: 'Short punchy line for homepage hero (e.g., "Turning bugs into lessons")',
                  },
                },
              ],
            },
          ],
        },
        // --- Tab 5: SEO meta ---
        {
          label: 'SEO',
          description: 'Metadata cho trang /me.',
          fields: [
            {
              name: 'meta',
              type: 'group',
              fields: [
                { name: 'metaTitle', type: 'text', localized: true },
                { name: 'metaDescription', type: 'textarea', localized: true },
              ],
            },
          ],
        },
      ],
    },
  ],
}
