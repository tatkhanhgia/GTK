import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const authState = vi.hoisted(() => ({
  user: null as unknown,
  payload: {},
}))

const fileStorageState = vi.hoisted(() => ({
  listAdminAiFileReferences: vi.fn(async () => []),
}))

vi.mock('@/lib/admin/payload-admin-api-auth', () => ({
  requirePayloadAdminApi: vi.fn(() => Promise.resolve(authState)),
}))

vi.mock('@/lib/admin-ai/files/admin-ai-file-storage-service', () => ({
  listAdminAiFileReferences: fileStorageState.listAdminAiFileReferences,
  createAdminAiFileReference: vi.fn(),
}))

describe('admin AI files API', () => {
  beforeEach(() => {
    authState.user = null
    authState.payload = {}
    fileStorageState.listAdminAiFileReferences.mockReset()
    fileStorageState.listAdminAiFileReferences.mockResolvedValue([])
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('rejects unauthenticated list requests with JSON 401', async () => {
    const { GET } = await import('@/app/api/admin/ai/files/route')
    const response = await GET()

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toMatchObject({ error: { code: 'UNAUTHORIZED' } })
  })

  it('logs unexpected file API failures with a request id', async () => {
    authState.user = { id: 'admin-1' }
    fileStorageState.listAdminAiFileReferences.mockRejectedValue(new Error('database unavailable'))
    const { GET } = await import('@/app/api/admin/ai/files/route')

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error.message).toMatch(/^Admin AI file request failed\. Request ID: admin-ai-file-/)
    expect(console.error).toHaveBeenCalledWith(
      expect.stringMatching(/^\[admin-ai-file-.+\] Admin AI file request failed$/),
      expect.any(Error),
    )
  })
})
