import { defineRouting } from 'next-intl/routing'
import { locales, defaultLocale } from './config'

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Always show locale in URL: /vi/blog, /en/blog
  localePrefix: 'always',
})
