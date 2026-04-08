import '@/app/globals.css'
import { SiteThemeProvider } from '@/components/providers/site-theme-provider'

/**
 * Site Layout (Server Component)
 *
 * Provides the <html>/<body> document structure for site routes.
 * Must be a Server Component so that globals.css is bundled into the
 * server CSS chunk and emitted in deterministic order on SSR.
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
        <SiteThemeProvider>{children}</SiteThemeProvider>
      </body>
    </html>
  )
}
