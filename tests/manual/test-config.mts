import '../../src/scripts/patch-next-env.cjs'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { vi } from '@payloadcms/translations/languages/vi'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import usersModule from '../../src/collections/users.ts'
import categoriesModule from '../../src/collections/categories.ts'
import digitalDownloadsModule from '../../src/collections/digital-downloads.ts'
import mediaModule from '../../src/collections/media.ts'
import postsModule from '../../src/collections/posts.ts'
import productsModule from '../../src/collections/products.ts'
import pagesModule from '../../src/collections/pages.ts'
import translationsModule from '../../src/collections/translations.ts'
import authorProfileModule from '../../src/globals/author-profile.ts'
import generatedTranslationsModule from '../../src/admin/i18n/generated-translations.ts'
import migrationsModule from '../../src/migrations/index.ts'

const { Users } = usersModule
const { Categories } = categoriesModule
const { DigitalDownloads } = digitalDownloadsModule
const { Media } = mediaModule
const { Posts } = postsModule
const { Products } = productsModule
const { Pages } = pagesModule
const { Translations } = translationsModule
const { AuthorProfile } = authorProfileModule
const { generatedTranslations } = generatedTranslationsModule
const { migrations } = migrationsModule

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
  collections: [Users, Categories, DigitalDownloads, Media, Posts, Products, Pages, Translations],
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
