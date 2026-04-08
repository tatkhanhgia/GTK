import React from 'react'

/**
 * Root Layout
 *
 * Minimal passthrough — each route group provides its own <html>/<body>:
 * - (payload): Payload's RootLayout handles the document structure
 * - (site): SiteLayout provides <html>/<body> with ThemeProvider
 * - (auth): AuthLayout provides <html>/<body>
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
