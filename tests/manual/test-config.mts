import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { vi } from '@payloadcms/translations/languages/vi'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { Users } from './src/collections/users.ts'
import { Categories } from './src/collections/categories.ts'
import { Media } from './src/collections/media.ts'
import { Posts } from './src/collections/posts.ts'
import { Products } from './src/collections/products.ts'
import { Pages } from './src/collections/pages.ts'
import { Translations } from './src/collections/translations.ts'
import { AuthorProfile } from './src/globals/author-profile.ts'
import { generatedTranslations } from './src/admin/i18n/generated-translations.ts'
import { migrations } from './src/migrations/index.ts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  i18n: {
    supportedLanguages: { vi, en },
    fallbackLanguage: 'vi',
    translations: generatedTranslations,
  },
  admin: {
    user: 'users',
    suppressHydrationWarning: true,
    meta: { titleSuffix: ' - GTKBlog Admin' },
    routes: {
      account: '/account',
      browseByFolder: '/browse-by-folder',
      createFirstUser: '/create-first-user',
      forgot: '/forgot',
      inactivity: '/logout-inactivity',
      login: '/login',
      logout: '/logout',
      reset: '/reset',
      unauthorized: '/unauthorized',
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
  collections: [Users, Categories, Media, Posts, Products, Pages, Translations],
  globals: [AuthorProfile],
  routes: {
    admin: '/admin',
    api: '/api',
    graphQL: '/graphql',
    graphQLPlayground: '/graphql-playground',
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    prodMigrations: migrations,
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
