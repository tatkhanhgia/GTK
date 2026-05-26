import { afterEach, describe, expect, it } from 'vitest'
import {
  decryptAdminAiSecret,
  encryptAdminAiSecret,
  isEncryptedAdminAiSecret,
  maskAdminAiSecret,
} from '@/lib/admin-ai/admin-ai-secret-crypto'

describe('admin AI secret crypto', () => {
  afterEach(() => {
    delete process.env.ADMIN_AI_ENCRYPTION_KEY
    delete process.env.PAYLOAD_SECRET
  })

  it('encrypts, detects, decrypts, and masks provider secrets', () => {
    process.env.ADMIN_AI_ENCRYPTION_KEY = 'test-admin-ai-key'

    const encrypted = encryptAdminAiSecret('sk-test-secret')

    expect(encrypted).toMatch(/^admin-ai:enc:v1:/)
    expect(encrypted).not.toContain('sk-test-secret')
    expect(isEncryptedAdminAiSecret(encrypted)).toBe(true)
    expect(decryptAdminAiSecret(encrypted)).toBe('sk-test-secret')
    expect(maskAdminAiSecret(encrypted)).toBe('********')
  })

  it('falls back to PAYLOAD_SECRET outside production', () => {
    process.env.PAYLOAD_SECRET = 'payload-secret'

    expect(decryptAdminAiSecret(encryptAdminAiSecret('fallback-key'))).toBe('fallback-key')
  })
})
