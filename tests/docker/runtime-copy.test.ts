import { readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'

describe('Docker runtime source copies', () => {
  it('copies source dependencies imported by Payload globals loaded through tsx', () => {
    const dockerfile = readFileSync('Dockerfile', 'utf8')
    const emailSettingsGlobal = readFileSync('src/globals/email-settings.ts', 'utf8')

    expect(dockerfile).toContain('/app/src/globals ./src/globals')
    expect(dockerfile).toContain(
      '/app/src/lib/email/email-secret-crypto.ts ./src/lib/email/email-secret-crypto.ts',
    )
    expect(emailSettingsGlobal).toContain('../lib/email/email-secret-crypto')
    expect(emailSettingsGlobal).not.toContain('@/lib/email/email-secret-crypto')
  })
})
