import React from 'react'
import { BodyUnresolvedFix } from '@/components/providers/body-unresolved-fix'

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
  return (
    <>
      {/*
        Next.js dev mode injects a body[unresolved] style rule to prevent FOUC.
        When Payload CMS causes a hydration mismatch (common with style-tag
        ordering in <head>), React re-renders on the client but can leave
        body[unresolved] in place, making the page invisible. This client
        component removes the attribute after hydration.
      */}
      <BodyUnresolvedFix />
      {children}
    </>
  )
}
