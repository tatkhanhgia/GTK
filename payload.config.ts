import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { vi } from '@payloadcms/translations/languages/vi'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { Users } from './src/collections/users'
import { Categories } from './src/collections/categories'
import { Media } from './src/collections/media'
import { Posts } from './src/collections/posts'
import { Products } from './src/collections/products'
import { Pages } from './src/collections/pages'
import { Translations } from './src/collections/translations'
import { AuthorProfile } from './src/globals/author-profile'
import { generatedTranslations } from './src/admin/i18n/generated-translations'
import { migrations } from './src/migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  // Vietnamese is the primary admin language. Without an explicit
  // supportedLanguages/fallbackLanguage, the admin UI defaults to English,
  // producing a mixed UX where field labels are Vietnamese but framework
  // chrome ("Edit", "API", "Save", validation messages) stays English.
  i18n: {
    supportedLanguages: { vi, en },
    fallbackLanguage: 'vi',
    // Custom admin UI strings (sidebar, header, dashboard) live in a dedicated
    // module so this config file stays small. Payload merges these with the
    // core translations imported above, giving us a single `t('customHeader:...')`
    // call site for everything we own.
    translations: generatedTranslations,
  },
  admin: {
    user: 'users',
    // Browser extensions (translators, dark-mode, FOUC preventers) often
    // inject a <style> tag into <head> before React hydrates, shifting the
    // position of Payload's own `@layer payload-default, payload;` style and
    // producing a root-level hydration mismatch. This flag is Payload's
    // official escape hatch for that exact scenario.
    suppressHydrationWarning: true,
    meta: {
      titleSuffix: ' - GTKBlog Admin',
    },
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
