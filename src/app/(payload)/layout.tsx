import config from '@payload-config'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import type { SanitizedConfig, ServerFunctionClient } from 'payload'
import React from 'react'
import { importMap } from './importMap'
import '@/app/globals.css'
import '@/admin/styles/admin-theme.css'
import '@/admin/styles/component-overrides.css'
import { AdminHydrationSuppressor } from './admin-hydration-suppressor'

type ConfigExport = SanitizedConfig | { default: SanitizedConfig }

const serverConfig = Promise.resolve(config as unknown as ConfigExport).then((resolvedConfig) =>
  'default' in resolvedConfig ? resolvedConfig.default : resolvedConfig,
)

const serverFunction: ServerFunctionClient = async (args) => {
  'use server'
  return handleServerFunctions({ ...args, config: serverConfig, importMap })
}

// Force dynamic rendering to avoid stale static shells after HMR,
// which can trigger hydration mismatches in the admin panel.
export const dynamic = 'force-dynamic'

/**
 * Payload Admin Layout
 *
 * Uses Payload's RootLayout which provides its own document structure.
 * Note: This creates a nested HTML situation because the root layout
 * already provides <html> and <body>. This is a known limitation when
 * using Payload CMS with Next.js App Router route groups.
 *
 * Hydration mismatches in <head> styles are common in dev mode (ngrok,
 * browser extensions, CSS chunk ordering). We avoid the manual
 * @payloadcms/next/css import (RootLayout injects it itself) and rely
 * on AdminHydrationSuppressor + payload.config.ts suppressHydrationWarning
 * to keep the console clean and the page visible.
 */
export default async function PayloadAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootLayout
      config={serverConfig}
      importMap={importMap}
      serverFunction={serverFunction}
    >
      <div suppressHydrationWarning>
        <AdminHydrationSuppressor />
        {children}
      </div>
    </RootLayout>
  )
}
