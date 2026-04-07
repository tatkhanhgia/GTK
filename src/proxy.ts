import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'
import { type NextRequest, NextResponse } from 'next/server'

// Paths that require an authenticated session (without locale prefix)
const PROTECTED_PATHS = ['/profile', '/checkout', '/downloads']

// next-intl middleware handles locale detection, prefix enforcement, and redirects
const i18nMiddleware = createMiddleware(routing)

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip Payload admin, API routes, auth pages, Next.js internals, and static assets
  // Auth pages live in (auth) route group — no locale prefix
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|xml|txt|woff2?|ttf|otf)$/.test(pathname)
  ) {
    return NextResponse.next()
  }

  // Auth check: strip locale prefix to get canonical path
  // e.g. /vi/profile → /profile, /en/checkout → /checkout
  const segments = pathname.split('/')
  const localeInPath = ['vi', 'en'].includes(segments[1]) ? segments[1] : null
  const cleanPath = localeInPath
    ? '/' + segments.slice(2).join('/')
    : pathname

  const isProtected = PROTECTED_PATHS.some(
    (p) => cleanPath === p || cleanPath.startsWith(p + '/')
  )

  if (isProtected) {
    // Lightweight cookie check — no full auth SDK needed at edge
    // Cookie name uses the prefix configured in auth-config.ts: 'gtkblog'
    const sessionCookie =
      request.cookies.get('gtkblog.session_token') ??
      request.cookies.get('better-auth.session_token')

    if (!sessionCookie?.value) {
      const locale = localeInPath ?? 'vi'
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
    }
  }

  // Delegate all locale routing (detection, prefix, redirection) to next-intl
  return i18nMiddleware(request)
}

export const config = {
  matcher: [
    // Match all paths except Next.js static files and optimized images
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
