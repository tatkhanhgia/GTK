import { beforeEach, describe, expect, it, vi } from 'vitest'

const authState = vi.hoisted(() => ({
  user: null as unknown,
  payload: {},
}))

vi.mock('@/lib/admin/payload-admin-api-auth', () => ({
  requirePayloadAdminApi: vi.fn(() => Promise.resolve(authState)),
}))

describe('admin AI action APIs', () => {
  beforeEach(() => {
    authState.user = null
    authState.payload = {}
  })

  it('rejects unauthenticated confirm requests with JSON 401', async () => {
    const { POST } = await import('@/app/api/admin/ai/actions/confirm/route')
    const response = await POST(new Request('https://app.test/api/admin/ai/actions/confirm', {
      method: 'POST',
      body: JSON.stringify({ id: '1' }),
    }))

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toMatchObject({ error: { code: 'UNAUTHORIZED' } })
  })
})
