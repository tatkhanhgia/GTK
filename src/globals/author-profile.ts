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
    // --- Philosophy ---
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
