import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

// next-intl plugin — points to request config for server-side locale resolution
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  output: 'standalone', // Required for Docker multi-stage build (copies server.js + minimal deps)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  // experimental: { reactCompiler: true } — enable when React Compiler is stable
}

// Plugin chain: withPayload wraps withNextIntl(nextConfig)
export default withPayload(withNextIntl(nextConfig))
