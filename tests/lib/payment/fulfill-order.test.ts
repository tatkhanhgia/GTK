import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock @payloadcms/db-postgres sql tag
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

// Sequence of execute calls: order lookup, update, items lookup, update fulfilled
const mockExecute = vi.fn()

vi.mock('payload', () => ({
  getPayload: vi.fn().mockResolvedValue({
    db: { drizzle: { execute: mockExecute } },
  }),
}))

vi.mock('@payload-config', () => ({ default: {} }))

vi.mock('@/lib/payment/download-token', () => ({
  generateDownloadToken: vi.fn().mockResolvedValue('mock-token-abc'),
}))

describe('fulfillOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('skips fulfillment if order already fulfilled', async () => {
    // First execute: order lookup → already fulfilled
    mockExecute.mockResolvedValueOnce({
      rows: [{ id: 'order-1', user_id: 'user-1', status: 'fulfilled' }],
    })

    const { fulfillOrder } = await import('@/lib/payment/fulfill-order')
    await fulfillOrder('order-1', 'payment-1')

    // Only one execute call (the lookup) — no UPDATE issued
    expect(mockExecute).toHaveBeenCalledTimes(1)
  })

  it('returns early if order not found', async () => {
    mockExecute.mockResolvedValueOnce({ rows: [] })

    const { fulfillOrder } = await import('@/lib/payment/fulfill-order')
    await fulfillOrder('missing-order', 'payment-x')

    expect(mockExecute).toHaveBeenCalledTimes(1)
  })

  it('fulfills a pending order with items', async () => {
    // 1. order lookup → pending
    mockExecute.mockResolvedValueOnce({
      rows: [{ id: 'order-1', user_id: 'user-1', status: 'pending' }],
    })
    // 2. UPDATE orders SET status = 'paid'
    mockExecute.mockResolvedValueOnce({ rows: [] })
    // 3. SELECT order_items
    mockExecute.mockResolvedValueOnce({
      rows: [{ id: 'item-1', order_id: 'order-1', product_id: 'prod-1' }],
    })
    // 4. UPDATE orders SET status = 'fulfilled'
    mockExecute.mockResolvedValueOnce({ rows: [] })

    const { fulfillOrder } = await import('@/lib/payment/fulfill-order')
    const { generateDownloadToken } = await import('@/lib/payment/download-token')

    await fulfillOrder('order-1', 'payment-xyz')

    // 4 execute calls: lookup, paid update, items select, fulfilled update
    expect(mockExecute).toHaveBeenCalledTimes(4)
    // generateDownloadToken called once per item
    expect(generateDownloadToken).toHaveBeenCalledWith('order-1', 'item-1', 'prod-1', 'user-1')
  })

  it('fulfills order with no items (no download tokens generated)', async () => {
    mockExecute.mockResolvedValueOnce({
      rows: [{ id: 'order-2', user_id: 'user-2', status: 'pending' }],
    })
    mockExecute.mockResolvedValueOnce({ rows: [] }) // paid update
    mockExecute.mockResolvedValueOnce({ rows: [] }) // items query — empty
    mockExecute.mockResolvedValueOnce({ rows: [] }) // fulfilled update

    const { fulfillOrder } = await import('@/lib/payment/fulfill-order')
    const { generateDownloadToken } = await import('@/lib/payment/download-token')

    await fulfillOrder('order-2', 'payment-yyy')

    expect(generateDownloadToken).not.toHaveBeenCalled()
    expect(mockExecute).toHaveBeenCalledTimes(4)
  })
})
