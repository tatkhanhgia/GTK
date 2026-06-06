import { beforeEach, describe, expect, it, vi } from 'vitest'

const authState = vi.hoisted(() => ({
  user: null as unknown,
  payload: {},
}))

vi.mock('@/lib/admin/payload-admin-api-auth', () => ({
  requirePayloadAdminApi: vi.fn(() => Promise.resolve(authState)),
}))

describe('admin AI session APIs', () => {
  beforeEach(() => {
    authState.user = null
    authState.payload = {}
  })

  it('rejects unauthenticated list requests with JSON 401', async () => {
    const { GET } = await import('@/app/api/admin/ai/sessions/route')
    const response = await GET()

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toMatchObject({ error: { code: 'UNAUTHORIZED' } })
  })

  it('rejects unauthenticated detail requests with JSON 401', async () => {
    const { GET } = await import('@/app/api/admin/ai/sessions/[id]/route')
    const response = await GET(new Request('https://app.test/api/admin/ai/sessions/1'), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toMatchObject({ error: { code: 'UNAUTHORIZED' } })
  })
})
