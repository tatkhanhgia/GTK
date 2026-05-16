import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

// next-intl plugin — points to request config for server-side locale resolution
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  output: 'standalone', // Required for Docker multi-stage build (copies server.js + minimal deps)
  devIndicators: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      { protocol: 'https', hostname: 'img.vietqr.io', pathname: '/image/**' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  compress: true,
  experimental: {
    // Force deterministic CSS chunk ordering across server/client bundles.
    // Fixes hydration mismatch on /admin where Payload's @layer declaration
    // and Tailwind v4's @layer directives get split into multiple chunks
    // that load in different order between SSR and client hydration.
    cssChunking: 'strict',
  },
}

// Plugin chain: withPayload wraps withNextIntl(nextConfig)
export default withPayload(withNextIntl(nextConfig))
