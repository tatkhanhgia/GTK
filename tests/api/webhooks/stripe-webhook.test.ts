import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Controllable constructEvent mock
const mockConstructEvent = vi.fn()

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: mockConstructEvent,
    },
  })),
}))

// Mock stripe-config so the route gets the mocked Stripe instance
vi.mock('@/lib/payment/stripe-config', () => ({
  stripe: {
    webhooks: {
      constructEvent: mockConstructEvent,
    },
  },
}))

const mockFulfillOrder = vi.fn().mockResolvedValue(undefined)

vi.mock('@/lib/payment/fulfill-order', () => ({
  fulfillOrder: mockFulfillOrder,
}))

// Mock payload / payload-config so route-level imports don't blow up
vi.mock('payload', () => ({ getPayload: vi.fn() }))
vi.mock('@payload-config', () => ({ default: {} }))

describe('Stripe webhook POST /api/webhooks/stripe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns 400 when stripe-signature header is missing', async () => {
    const { POST } = await import('@/app/api/webhooks/stripe/route')

    const req = new NextRequest('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: '{}',
    })

    const response = await POST(req)
    expect(response.status).toBe(400)

    const body = await response.json()
    expect(body.error).toBe('No signature')
  })

  it('returns 400 when constructEvent throws (invalid signature)', async () => {
    mockConstructEvent.mockImplementationOnce(() => {
      throw new Error('Webhook signature verification failed')
    })

    const { POST } = await import('@/app/api/webhooks/stripe/route')

    const req = new NextRequest('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: '{}',
      headers: { 'stripe-signature': 'invalid_sig' },
    })

    const response = await POST(req)
    expect(response.status).toBe(400)

    const body = await response.json()
    expect(body.error).toBe('Invalid signature')
  })

  it('returns 200 and calls fulfillOrder for checkout.session.completed with paid status', async () => {
    mockConstructEvent.mockReturnValueOnce({
      type: 'checkout.session.completed',
      data: {
        object: {
          payment_status: 'paid',
          payment_intent: 'pi_test_123',
          metadata: { orderId: 'order-abc' },
        },
      },
    })

    const { POST } = await import('@/app/api/webhooks/stripe/route')

    const req = new NextRequest('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: '{"type":"checkout.session.completed"}',
      headers: { 'stripe-signature': 'valid_sig' },
    })

    const response = await POST(req)
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.received).toBe(true)

    expect(mockFulfillOrder).toHaveBeenCalledOnce()
    expect(mockFulfillOrder).toHaveBeenCalledWith('order-abc', 'pi_test_123')
  })

  it('returns 200 but does NOT call fulfillOrder when payment_status is not paid', async () => {
    mockConstructEvent.mockReturnValueOnce({
      type: 'checkout.session.completed',
      data: {
        object: {
          payment_status: 'unpaid',
          payment_intent: 'pi_test_456',
          metadata: { orderId: 'order-def' },
        },
      },
    })

    const { POST } = await import('@/app/api/webhooks/stripe/route')

    const req = new NextRequest('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: '{}',
      headers: { 'stripe-signature': 'valid_sig' },
    })

    const response = await POST(req)
    expect(response.status).toBe(200)
    expect(mockFulfillOrder).not.toHaveBeenCalled()
  })

  it('returns 200 but does NOT call fulfillOrder when orderId metadata is missing', async () => {
    mockConstructEvent.mockReturnValueOnce({
      type: 'checkout.session.completed',
      data: {
        object: {
          payment_status: 'paid',
          payment_intent: 'pi_test_789',
          metadata: {}, // no orderId
        },
      },
    })

    const { POST } = await import('@/app/api/webhooks/stripe/route')

    const req = new NextRequest('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: '{}',
      headers: { 'stripe-signature': 'valid_sig' },
    })

    const response = await POST(req)
    expect(response.status).toBe(200)
    expect(mockFulfillOrder).not.toHaveBeenCalled()
  })

  it('returns 200 for unhandled event types without side effects', async () => {
    mockConstructEvent.mockReturnValueOnce({
      type: 'payment_intent.created',
      data: { object: {} },
    })

    const { POST } = await import('@/app/api/webhooks/stripe/route')

    const req = new NextRequest('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: '{}',
      headers: { 'stripe-signature': 'valid_sig' },
    })

    const response = await POST(req)
    expect(response.status).toBe(200)
    expect(mockFulfillOrder).not.toHaveBeenCalled()
  })
})
