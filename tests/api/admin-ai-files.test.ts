import { beforeEach, describe, expect, it, vi } from 'vitest'

const authState = vi.hoisted(() => ({
  user: null as unknown,
  payload: {},
}))

vi.mock('@/lib/admin/payload-admin-api-auth', () => ({
  requirePayloadAdminApi: vi.fn(() => Promise.resolve(authState)),
}))

describe('admin AI files API', () => {
  beforeEach(() => {
    authState.user = null
    authState.payload = {}
  })

  it('rejects unauthenticated list requests with JSON 401', async () => {
    const { GET } = await import('@/app/api/admin/ai/files/route')
    const response = await GET()

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toMatchObject({ error: { code: 'UNAUTHORIZED' } })
  })
})
