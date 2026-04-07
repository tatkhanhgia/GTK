'use client'

import { usePathname } from 'next/navigation'
import './globals.css'

/**
 * Root Layout
 *
 * Conditionally renders layout based on route:
 * - Admin routes (/admin/*): Render children directly without site wrapper
 * - Site routes: Provide full site layout with fonts and styling
 *
 * This prevents the nested HTML issue where Payload's RootLayout
 * tries to render its own <html> element.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  // For admin routes, don't add any wrapper - let Payload handle everything
  if (isAdminRoute) {
    return <>{children}</>
  }

  // For site routes, provide full document structure
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground font-body antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
