import config from '@payload-config'
import '@payloadcms/next/css'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import type { ServerFunctionClient } from 'payload'
import React from 'react'
import { importMap } from './importMap'
import '@/app/globals.css'
import '@/admin/styles/admin-theme.css'
import '@/admin/styles/component-overrides.css'

// Bound server action — passes config + importMap to handleServerFunctions
const serverFunction: ServerFunctionClient = async (args) => {
  'use server'
  return handleServerFunctions({ ...args, config, importMap })
}

/**
 * Payload Admin Layout
 *
 * Uses Payload's RootLayout which provides its own document structure.
 * Note: This creates a nested HTML situation because the root layout
 * already provides <html> and <body>. This is a known limitation when
 * using Payload CMS with Next.js App Router route groups.
 *
 * The suppressHydrationWarning on the root layout helps mitigate
 * the hydration mismatch warnings.
 */
export default async function PayloadAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      <div suppressHydrationWarning>
        {children}
      </div>
    </RootLayout>
  )
}
