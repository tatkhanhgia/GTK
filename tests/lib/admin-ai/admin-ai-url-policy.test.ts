import { describe, expect, it } from 'vitest'
import { isAllowedAdminAiBaseUrl, getAdminAiBaseUrlPolicyMessage } from '@/lib/admin-ai/admin-ai-url-policy'

describe('admin AI URL policy', () => {
  it('allows local and private-network HTTP providers in development/test', () => {
    expect(isAllowedAdminAiBaseUrl(new URL('http://localhost:1234'))).toBe(true)
    expect(isAllowedAdminAiBaseUrl(new URL('http://127.0.0.1:1234'))).toBe(true)
    expect(isAllowedAdminAiBaseUrl(new URL('http://169.254.83.107:1234'))).toBe(true)
    expect(isAllowedAdminAiBaseUrl(new URL('http://172.20.16.1:1234'))).toBe(true)
  })

  it('keeps public http providers blocked', () => {
    expect(isAllowedAdminAiBaseUrl(new URL('http://8.8.8.8:1234'))).toBe(false)
    expect(getAdminAiBaseUrlPolicyMessage()).toContain('https')
  })
})
