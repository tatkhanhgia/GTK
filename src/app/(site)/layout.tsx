'use client'

import { ThemeProvider } from 'next-themes'

/**
 * Site Layout
 *
 * Wraps all site routes with ThemeProvider and other site-specific providers.
 * This layout is separate from the root layout to allow the Payload admin
 * to have its own layout structure without conflicts.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  )
}
