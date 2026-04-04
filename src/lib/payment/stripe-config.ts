import Stripe from 'stripe'

// Server-side Stripe instance — never expose secret key to client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
})
