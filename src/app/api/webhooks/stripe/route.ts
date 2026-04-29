import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { fulfillOrder } from '@/lib/payment/fulfill-order'
import { getStripeClient } from '@/lib/payment/stripe-config'

/**
 * Stripe webhook handler.
 * SECURITY: Reads the raw request body via request.text() for signature verification.
 * Idempotency is handled inside fulfillOrder.
 */
export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      return NextResponse.json({ error: 'Stripe webhook not configured' }, { status: 503 })
    }
    const stripe = getStripeClient()
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    if (session.payment_status === 'paid' && session.metadata?.orderId) {
      await fulfillOrder(session.metadata.orderId, session.payment_intent as string)
    }
  }

  return NextResponse.json({ received: true })
}
