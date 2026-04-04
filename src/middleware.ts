import { NextRequest, NextResponse } from 'next/server'

// =============================================================================
// Composable Middleware Skeleton
//
// EXTENSION POINTS:
//   Phase 4 (Auth)  — replaces the middleware body to integrate Better Auth
//   Phase 5 (i18n)  — chains next-intl createMiddleware before auth checks
//
// HOW TO EXTEND (future phases):
//   Import your middleware factory, compose via the chain below.
//   Do NOT rewrite this file from scratch — extend the middleware() function body.
// =============================================================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip Payload admin, API routes, Next.js internals, and static assets
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf)$/.test(pathname)
  ) {
    return NextResponse.next()
  }

  // --- Phase 5 slot: i18n routing (next-intl) ---
  // Replace this comment with: return i18nMiddleware(request)

  // --- Phase 4 slot: auth session check (Better Auth) ---
  // Replace this comment with auth redirect logic

  return NextResponse.next()
}

export const config = {
  // Match all paths except Next.js static files and images
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
