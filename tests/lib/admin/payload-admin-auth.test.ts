import { describe, expect, it } from 'vitest'
import { isPayloadAdminUser } from '@/lib/admin/payload-admin-access'

describe('payload admin authorization', () => {
  it('allows Payload users with the admin role', () => {
    expect(isPayloadAdminUser({ id: 'admin-1', role: 'admin' })).toBe(true)
  })

  it('denies signed-in Payload editors for sensitive admin tools', () => {
    expect(isPayloadAdminUser({ id: 'editor-1', role: 'editor' })).toBe(false)
  })
})
