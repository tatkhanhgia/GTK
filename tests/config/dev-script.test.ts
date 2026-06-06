import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('development server script', () => {
  it('uses webpack for Payload admin stability in local development', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts?: Record<string, string>
    }

    expect(pkg.scripts?.dev).toContain('next dev --webpack')
  })
})
