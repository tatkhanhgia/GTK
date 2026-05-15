import { describe, expect, it } from 'vitest'
import { EmailSettings } from '@/globals/email-settings'

describe('email-settings global access', () => {
  it('allows admins to manage email settings', async () => {
    const canUpdate = await EmailSettings.access?.update?.({
      req: { user: { id: 'admin-1', role: 'admin' } },
    } as never)

    expect(canUpdate).toBe(true)
  })

  it('denies editors access to email secret settings', async () => {
    const canRead = await EmailSettings.access?.read?.({
      req: { user: { id: 'editor-1', role: 'editor' } },
    } as never)

    expect(canRead).toBe(false)
  })
})
