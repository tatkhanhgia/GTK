'use client'

import '@/app/globals.css'
import { ThemeProvider } from 'next-themes'

/**
 * Site Layout
 *
 * Provides the full document structure for site routes.
 * Wraps with ThemeProvider for dark/light mode support.
 * suppressHydrationWarning on <html>/<body> is required for next-themes.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className="min-h-screen bg-background text-foreground font-body antialiased"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
