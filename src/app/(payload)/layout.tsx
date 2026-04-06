import config from '@payload-config'
import '@payloadcms/next/css'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import type { ServerFunctionClient } from 'payload'
import React from 'react'
import { importMap } from './importMap'

// Bound server action — passes config + importMap to handleServerFunctions
const serverFunction: ServerFunctionClient = async (args) => {
  'use server'
  return handleServerFunctions({ ...args, config, importMap })
}

// Isolated layout for Payload admin — provides ConfigProvider, AuthProvider, i18n, etc.
// Uses Payload's RootLayout which sets up all required React providers (ConfigProvider, RootProvider, etc.)
// Without RootLayout, PageConfigProvider's useConfig() call returns undefined → 500 error.
export default async function PayloadAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  )
}
