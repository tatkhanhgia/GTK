import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  // The admin shell test imports .tsx files that contain JSX. Rolldown-Vite
  // uses oxc (not esbuild) as its transformer; we must configure it here so
  // that JSX is parsed with the automatic runtime instead of being fed as
  // raw text to import analysis.
  oxc: {
    jsx: {
      runtime: 'automatic',
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: [
      'tests/**/*.{test,spec}.{ts,tsx}',
      '__tests__/**/*.{test,spec}.{ts,tsx}',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/**'],
      exclude: ['src/lib/auth/auth-config.ts'], // DB dependency
    },
  },
  ssr: {
    noExternal: ['@payloadcms/ui', 'react-image-crop'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@payload-config': path.resolve(__dirname, './payload.config.ts'),
    },
  },
})
