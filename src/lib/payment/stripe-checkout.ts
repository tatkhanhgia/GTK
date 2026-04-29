'use server'

import { getStripeClient } from './stripe-config'
import { getSession } from '@/lib/auth/auth-helpers'
import { createOrder } from './create-order'
import { redirect } from 'next/navigation'

interface CreateCheckoutOptions {
  productId: string      // Payload product ID
  productName: string
  priceUSD: number       // cents
  stripeProductId?: string
  stripePriceId?: string
  locale?: string
}

/**
 * Server action: create a Stripe Checkout session and redirect to it.
 * Prices are sourced server-side — client only passes product ID.
 */
export async function createStripeCheckout({
  productId,
  productName,
  priceUSD,
  stripePriceId,
  locale = 'vi',
}: CreateCheckoutOptions) {
  const session = await getSession()
  if (!session) redirect(`/${locale}/login`)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Create pending order before redirecting to Stripe
  const orderId = await createOrder({
    userId: session.user.id,
    productId,
    productName,
    price: priceUSD,
    currency: 'USD',
    paymentMethod: 'stripe',
  })

  const stripe = getStripeClient()
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: stripePriceId
      ? [{ price: stripePriceId, quantity: 1 }]
      : [
          {
            price_data: {
              currency: 'usd',
              unit_amount: priceUSD,
              product_data: { name: productName },
            },
            quantity: 1,
          },
        ],
    success_url: `${appUrl}/${locale}/products/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/${locale}/products`,
    customer_email: session.user.email,
    metadata: {
      orderId,
      userId: session.user.id,
      productId,
    },
  })

  if (checkoutSession.url) {
    redirect(checkoutSession.url)
  }
}
