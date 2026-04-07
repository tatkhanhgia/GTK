import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { fulfillOrder } from '@/lib/payment/fulfill-order'
import { stripe } from '@/lib/payment/stripe-config'

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
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
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
