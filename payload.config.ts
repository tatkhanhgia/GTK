import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { Users } from './src/collections/users'
import { Categories } from './src/collections/categories'
import { Media } from './src/collections/media'
import { Posts } from './src/collections/posts'
import { Products } from './src/collections/products'
import { Pages } from './src/collections/pages'
import { AuthorProfile } from './src/globals/author-profile'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
    meta: {
      titleSuffix: ' - GTKBlog Admin',
    },
    components: {
      providers: ['@/admin/components/providers/admin-theme-provider#AdminThemeProvider'],
      header: ['@/admin/components/layout/custom-header#CustomHeader'],
      views: {
        dashboard: {
          Component: '@/admin/components/views/custom-dashboard#CustomDashboard',
        },
      },
    },
  },
  collections: [Users, Categories, Media, Posts, Products, Pages],
  globals: [AuthorProfile],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'dev-secret-change-me',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  localization: {
    locales: ['vi', 'en'],
    defaultLocale: 'vi',
    fallback: true,
  },
  sharp,
})
