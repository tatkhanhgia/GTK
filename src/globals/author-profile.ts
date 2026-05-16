import { FixedToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import type { GlobalConfig } from 'payload'

// All user-facing strings use StaticLabel form ({ vi, en }) so that the
// admin UI respects the current locale (set via the i18n picker in the
// top bar). Without this, labels would be hardcoded in Vietnamese and a
// user browsing in English would see mixed-language chrome.
export const AuthorProfile: GlobalConfig = {
  slug: 'author-profile',
  label: { vi: 'Hồ sơ tác giả', en: 'Author Profile' },
  access: {
    read: () => true,
    update: ({ req }) => !!req.user,
  },
  admin: {
    description: {
      vi: 'Thông tin cá nhân hiển thị trên trang /me.',
      en: 'Personal info displayed on the /me page.',
    },
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // --- Tab 1: Identity ---
        {
          label: { vi: 'Danh tính', en: 'Identity' },
          description: {
            vi: 'Thông tin nhận diện cơ bản hiển thị trên trang /me.',
            en: 'Basic identity information shown on the /me page.',
          },
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
              label: { vi: 'Họ và tên', en: 'Full name' },
            },
            {
              name: 'title',
              type: 'text',
              required: true,
              localized: true,
              label: { vi: 'Chức danh', en: 'Title' },
            },
            {
              name: 'yearsOfExperience',
              type: 'number',
              min: 0,
              label: { vi: 'Số năm kinh nghiệm', en: 'Years of experience' },
              admin: {
                description: {
                  vi: 'Số năm kinh nghiệm chuyên môn (hiển thị ở Quick Stats).',
                  en: 'Years of professional experience (shown in Quick Stats).',
                },
              },
            },
            {
              name: 'projectsCompleted',
              type: 'number',
              min: 0,
              label: { vi: 'Số dự án đã hoàn thành', en: 'Projects completed' },
              admin: {
                description: {
                  vi: 'Số dự án đã hoàn thành (hiển thị ở Quick Stats).',
                  en: 'Number of projects completed (shown in Quick Stats).',
                },
              },
            },
            {
              name: 'avatar',
              type: 'upload',
              relationTo: 'media',
              label: { vi: 'Ảnh đại diện', en: 'Avatar' },
            },
            {
              name: 'bio',
              type: 'richText',
              localized: true,
              label: { vi: 'Giới thiệu', en: 'Bio' },
            },
          ],
        },
        // --- Tab 2: Editorial content (Me page) ---
        {
          label: { vi: 'Nội dung', en: 'Content' },
          description: {
            vi: 'Nội dung biên tập cho trang /me.',
            en: 'Editorial content for the /me page.',
          },
          fields: [
            {
              name: 'meEditorial',
              type: 'group',
              label: { vi: 'Nội dung trang /me', en: '/me page content' },
              fields: [
                {
                  name: 'heroSentence',
                  type: 'text',
                  localized: true,
                  label: { vi: 'Câu dẫn hero', en: 'Hero sentence' },
                },
                {
                  name: 'buildingNow',
                  type: 'richText',
                  localized: true,
                  label: { vi: 'Đang xây dựng', en: 'Building now' },
                  editor: lexicalEditor({
                    features: ({ defaultFeatures }) => [
                      ...defaultFeatures,
                      FixedToolbarFeature({ applyToFocusedEditor: true }),
                    ],
                  }),
                },
                {
                  name: 'principles',
                  type: 'array',
                  label: { vi: 'Nguyên tắc', en: 'Principles' },
                  labels: {
                    singular: { vi: 'Nguyên tắc', en: 'Principle' },
                    plural: { vi: 'Các nguyên tắc', en: 'Principles' },
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      localized: true,
                      label: { vi: 'Tiêu đề', en: 'Title' },
                    },
                    {
                      name: 'description',
                      type: 'text',
                      localized: true,
                      label: { vi: 'Mô tả', en: 'Description' },
                    },
                  ],
                },
                {
                  name: 'selectedWriting',
                  type: 'array',
                  label: { vi: 'Bài viết chọn lọc', en: 'Selected writing' },
                  labels: {
                    singular: { vi: 'Bài viết', en: 'Writing' },
                    plural: { vi: 'Bài viết chọn lọc', en: 'Selected writing' },
                  },
                  fields: [
                    {
                      name: 'post',
                      type: 'relationship',
                      relationTo: 'posts',
                      required: true,
                      label: { vi: 'Bài viết', en: 'Post' },
                    },
                    {
                      name: 'note',
                      type: 'text',
                      localized: true,
                      label: { vi: 'Ghi chú', en: 'Note' },
                    },
                  ],
                },
                {
                  name: 'timelineContext',
                  type: 'text',
                  localized: true,
                  label: { vi: 'Ngữ cảnh timeline', en: 'Timeline context' },
                },
                {
                  name: 'contactCtaText',
                  type: 'text',
                  localized: true,
                  label: { vi: 'Nút kêu gọi liên hệ', en: 'Contact CTA text' },
                },
              ],
            },
            {
              name: 'homepageMarquee',
              type: 'group',
              label: { vi: 'Marquee trang chu', en: 'Homepage marquee' },
              admin: {
                description: {
                  vi: 'Noi dung dai chu de chay ngang tren trang chu. So giay lon hon nghia la chay cham hon.',
                  en: 'Topic strip shown on the homepage. Larger duration means slower movement.',
                },
              },
              fields: [
                {
                  name: 'enabled',
                  type: 'checkbox',
                  defaultValue: true,
                  label: { vi: 'Hien thi marquee', en: 'Show marquee' },
                },
                {
                  name: 'eyebrow',
                  type: 'text',
                  localized: true,
                  label: { vi: 'Nhan phu', en: 'Eyebrow' },
                  defaultValue: 'Dang tap trung',
                },
                {
                  name: 'durationSeconds',
                  type: 'number',
                  min: 12,
                  max: 180,
                  defaultValue: 48,
                  label: { vi: 'Thoi gian chay (giay)', en: 'Animation duration (seconds)' },
                  admin: {
                    description: {
                      vi: 'Nhap tu 12 den 180. Gia tri lon hon se chay cham hon.',
                      en: 'Enter 12 to 180. Higher values move more slowly.',
                    },
                  },
                },
                {
                  name: 'items',
                  type: 'array',
                  label: { vi: 'Chu de', en: 'Topics' },
                  labels: {
                    singular: { vi: 'Chu de', en: 'Topic' },
                    plural: { vi: 'Cac chu de', en: 'Topics' },
                  },
                  fields: [
                    {
                      name: 'label',
                      type: 'text',
                      localized: true,
                      required: true,
                      label: { vi: 'Nhan', en: 'Label' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        // --- Tab 3: Skills & Timeline ---
        {
          label: { vi: 'Kỹ năng & Lịch sử', en: 'Skills & Timeline' },
          description: {
            vi: 'Bộ kỹ năng và timeline sự nghiệp.',
            en: 'Skill set and career timeline.',
          },
          fields: [
            {
              name: 'skills',
              type: 'array',
              label: { vi: 'Kỹ năng', en: 'Skills' },
              labels: {
                singular: { vi: 'Nhóm kỹ năng', en: 'Skill category' },
                plural: { vi: 'Nhóm kỹ năng', en: 'Skill categories' },
              },
              fields: [
                {
                  name: 'category',
                  type: 'text',
                  required: true,
                  label: { vi: 'Nhóm', en: 'Category' },
                },
                {
                  name: 'items',
                  type: 'array',
                  label: { vi: 'Các kỹ năng', en: 'Skills' },
                  labels: {
                    singular: { vi: 'Kỹ năng', en: 'Skill' },
                    plural: { vi: 'Kỹ năng', en: 'Skills' },
                  },
                  fields: [
                    {
                      name: 'name',
                      type: 'text',
                      required: true,
                      label: { vi: 'Tên', en: 'Name' },
                    },
                  ],
                },
              ],
            },
            {
              name: 'timeline',
              type: 'array',
              label: { vi: 'Timeline', en: 'Timeline' },
              labels: {
                singular: { vi: 'Mục', en: 'Entry' },
                plural: { vi: 'Timeline', en: 'Timeline' },
              },
              fields: [
                {
                  name: 'year',
                  type: 'text',
                  required: true,
                  label: { vi: 'Năm', en: 'Year' },
                },
                {
                  name: 'title',
                  type: 'text',
                  localized: true,
                  label: { vi: 'Tiêu đề', en: 'Title' },
                },
                {
                  name: 'description',
                  type: 'text',
                  localized: true,
                  label: { vi: 'Mô tả', en: 'Description' },
                },
                {
                  name: 'type',
                  type: 'select',
                  defaultValue: 'work',
                  label: { vi: 'Loại', en: 'Type' },
                  options: [
                    { label: { vi: 'Công việc', en: 'Work' }, value: 'work' },
                    { label: { vi: 'Học vấn', en: 'Education' }, value: 'education' },
                    { label: { vi: 'Dự án', en: 'Project' }, value: 'project' },
                    { label: { vi: 'Cột mốc', en: 'Milestone' }, value: 'milestone' },
                  ],
                },
              ],
            },
          ],
        },
        // --- Tab 4: Social, contact & philosophy ---
        {
          label: { vi: 'Liên hệ', en: 'Contact' },
          description: {
            vi: 'Mạng xã hội, email liên hệ và triết lý cá nhân.',
            en: 'Social links, contact email, and personal philosophy.',
          },
          fields: [
            {
              name: 'socialLinks',
              type: 'array',
              label: { vi: 'Mạng xã hội', en: 'Social links' },
              labels: {
                singular: { vi: 'Liên kết', en: 'Social link' },
                plural: { vi: 'Liên kết', en: 'Social links' },
              },
              fields: [
                {
                  name: 'platform',
                  type: 'select',
                  required: true,
                  label: { vi: 'Nền tảng', en: 'Platform' },
                  options: [
                    { label: 'GitHub', value: 'github' },
                    { label: 'LinkedIn', value: 'linkedin' },
                    { label: 'X (Twitter)', value: 'x' },
                    { label: 'Facebook', value: 'facebook' },
                    { label: 'YouTube', value: 'youtube' },
                    { label: 'Email', value: 'email' },
                  ],
                  admin: {
                    components: {
                      Field:
                        '@/admin/components/fields/platform-select-field#PlatformSelectField',
                    },
                  },
                },
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                  label: { vi: 'Đường dẫn', en: 'URL' },
                },
              ],
            },
            {
              name: 'contactEmail',
              type: 'email',
              label: { vi: 'Email liên hệ', en: 'Contact email' },
              access: { read: ({ req }) => !!req.user },
              admin: {
                description: {
                  vi: 'Địa chỉ email nhận biểu mẫu liên hệ.',
                  en: 'Email address that receives contact form submissions.',
                },
              },
            },
            {
              name: 'philosophy',
              type: 'group',
              label: { vi: 'Triết lý cá nhân', en: 'Personal philosophy' },
              fields: [
                {
                  name: 'story',
                  type: 'richText',
                  localized: true,
                  label: { vi: 'Câu chuyện của tôi', en: 'My story' },
                  admin: {
                    description: {
                      vi: 'Câu chuyện cá nhân / lý do bạn làm điều này (hiển thị ở trang chủ).',
                      en: 'Personal story / why I do this (shown on homepage).',
                    },
                  },
                },
                {
                  name: 'workingPrinciples',
                  type: 'array',
                  label: { vi: 'Nguyên tắc làm việc', en: 'Working principles' },
                  labels: {
                    singular: { vi: 'Nguyên tắc', en: 'Principle' },
                    plural: { vi: 'Nguyên tắc làm việc', en: 'Working principles' },
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      localized: true,
                      label: { vi: 'Tiêu đề', en: 'Title' },
                    },
                    {
                      name: 'description',
                      type: 'textarea',
                      localized: true,
                      label: { vi: 'Mô tả', en: 'Description' },
                    },
                    {
                      name: 'icon',
                      type: 'select',
                      label: { vi: 'Biểu tượng', en: 'Icon' },
                      options: [
                        { label: { vi: 'Bóng đèn', en: 'Lightbulb' }, value: 'lightbulb' },
                        { label: { vi: 'Trái tim', en: 'Heart' }, value: 'heart' },
                        { label: { vi: 'Mục tiêu', en: 'Target' }, value: 'target' },
                        { label: { vi: 'Tên lửa', en: 'Rocket' }, value: 'rocket' },
                      ],
                    },
                  ],
                },
                {
                  name: 'heroTagline',
                  type: 'text',
                  localized: true,
                  label: { vi: 'Khẩu hiệu hero', en: 'Hero tagline' },
                  admin: {
                    description: {
                      vi: 'Câu ngắn gọn cho hero trang chủ (vd: "Biến bug thành bài học").',
                      en: 'Short punchy line for the homepage hero (e.g., "Turning bugs into lessons").',
                    },
                  },
                },
              ],
            },
          ],
        },
        // --- Tab 5: SEO meta ---
        {
          label: { vi: 'SEO', en: 'SEO' },
          description: {
            vi: 'Metadata cho trang /me.',
            en: 'Metadata for the /me page.',
          },
          fields: [
            {
              name: 'meta',
              type: 'group',
              label: { vi: 'Metadata', en: 'Metadata' },
              fields: [
                {
                  name: 'metaTitle',
                  type: 'text',
                  localized: true,
                  label: { vi: 'Tiêu đề meta', en: 'Meta title' },
                },
                {
                  name: 'metaDescription',
                  type: 'textarea',
                  localized: true,
                  label: { vi: 'Mô tả meta', en: 'Meta description' },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
