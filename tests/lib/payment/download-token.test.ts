import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock nanoid
vi.mock('nanoid', () => ({ nanoid: () => 'test-nanoid' }))

// Mock @payloadcms/db-postgres sql tag — just returns its template string args
vi.mock('@payloadcms/db-postgres', () => ({
  sql: new Proxy(
    (strings: TemplateStringsArray, ...values: unknown[]) =>
      ({ strings, values }),
    {
      get: (_target, prop) => {
        if (prop === 'raw') return (str: string) => str
        return (strings: TemplateStringsArray, ...values: unknown[]) => ({ strings, values })
      },
    }
  ),
}))

// Mock payload with db.execute returning empty rows by default
const mockExecute = vi.fn().mockResolvedValue({ rows: [] })

vi.mock('payload', () => ({
  getPayload: vi.fn().mockResolvedValue({
    db: { drizzle: { execute: mockExecute } },
  }),
}))

vi.mock('@payload-config', () => ({ default: {} }))

describe('download-token', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockExecute.mockResolvedValue({ rows: [] })
  })

  it('validateDownloadToken returns null for non-existent token', async () => {
    mockExecute.mockResolvedValueOnce({ rows: [] })

    const { validateDownloadToken } = await import('@/lib/payment/download-token')
    const result = await validateDownloadToken('invalid-token')
    expect(result).toBeNull()
  })

  it('validateDownloadToken returns record for valid token', async () => {
    const mockTokenRow = {
      id: 'dt-1',
      token: 'valid-token',
      order_id: 'order-123',
      order_item_id: 'item-123',
      product_id: 'prod-123',
      user_id: 'user-123',
      expires_at: new Date(Date.now() + 86400000),
      revoked: false,
      download_count: '0',
      created_at: new Date(),
    }
    mockExecute.mockResolvedValueOnce({ rows: [mockTokenRow] })

    const { validateDownloadToken } = await import('@/lib/payment/download-token')
    const result = await validateDownloadToken('valid-token')
    expect(result).toEqual(mockTokenRow)
  })

  it('generateDownloadToken calls db.execute and returns token string', async () => {
    // execute for INSERT — returns void-like
    mockExecute.mockResolvedValueOnce({ rows: [] })

    const { generateDownloadToken } = await import('@/lib/payment/download-token')
    const token = await generateDownloadToken('order-1', 'item-1', 'prod-1', 'user-1')

    expect(typeof token).toBe('string')
    expect(token.length).toBeGreaterThan(0)
    expect(mockExecute).toHaveBeenCalledTimes(1)
  })
})
