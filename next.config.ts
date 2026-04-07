import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

// next-intl plugin — points to request config for server-side locale resolution
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  output: 'standalone', // Required for Docker multi-stage build (copies server.js + minimal deps)
  allowedDevOrigins: ['yuko-unremonstrated-noah.ngrok-free.dev', '*.ngrok-free.app'],
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  compress: true,
  // experimental: { reactCompiler: true } — enable when React Compiler is stable
}

// Plugin chain: withPayload wraps withNextIntl(nextConfig)
export default withPayload(withNextIntl(nextConfig))
