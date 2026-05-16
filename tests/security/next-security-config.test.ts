import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { NextConfig } from 'next'
import { describe, expect, it } from 'vitest'
import nextConfigExport from '../../next.config'

const root = process.cwd()
type NextConfigExport = NextConfig | { default: NextConfig }

const resolveNextConfig = (configExport: NextConfigExport): NextConfig =>
  'default' in configExport ? configExport.default : configExport

const nextConfig = resolveNextConfig(nextConfigExport as NextConfigExport)

describe('Next.js security configuration', () => {
  it('uses a patched Next.js major version supported by Payload', () => {
    const packageJson = JSON.parse(
      readFileSync(join(root, 'package.json'), 'utf8')
    ) as { dependencies?: Record<string, string> }

    expect(packageJson.dependencies?.next).toBe('16.2.6')
  })

  it('does not allow arbitrary remote hosts in the image optimizer', () => {
    const remotePatterns = nextConfig.images?.remotePatterns ?? []

    expect(remotePatterns).toEqual([
      { protocol: 'https', hostname: 'img.vietqr.io', pathname: '/image/**' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ])
    expect(
      remotePatterns.some((pattern) => pattern.hostname.includes('*'))
    ).toBe(false)
  })
})
