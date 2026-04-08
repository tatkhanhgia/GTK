'use client'

import { ThemeProvider } from 'next-themes'
import type { ReactNode } from 'react'

/**
 * Client-only wrapper for next-themes ThemeProvider.
 *
 * Extracted so that the (site) layout can remain a Server Component —
 * layouts that render <html> MUST be server components to keep global
 * CSS imports in the server chunk and avoid CSS ordering hydration errors.
 */
export function SiteThemeProvider({ children }: { children: ReactNode }) {
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
