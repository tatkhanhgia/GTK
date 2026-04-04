import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/payment/stripe-config'
import { fulfillOrder } from '@/lib/payment/fulfill-order'
import Stripe from 'stripe'

/**
 * Stripe webhook handler.
 * SECURITY: Uses raw body for signature verification — body parsing is disabled.
 * Idempotency is handled inside fulfillOrder.
 */
export async function POST(request: NextRequest) {
  const body = await request.text() // raw body required for Stripe signature verification
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

// Disable body parsing — raw body is required for Stripe signature verification
export const config = {
  api: { bodyParser: false },
}
