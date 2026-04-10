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
import { AuthorProfile } from './src/globals/author-profile'

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
