import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/auth-helpers'
import { createOrder } from '@/lib/payment/create-order'
import { getPayload } from 'payload'
import config from '@payload-config'

interface CreateSepayOrderBody {
  productId: string
  productName: string
  priceVND: number
}

/**
 * Create a pending SePay order for VietQR bank transfer.
 * Price is verified server-side against Payload CMS — client-supplied priceVND is ignored.
 */
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: CreateSepayOrderBody
  try {
    body = (await request.json()) as CreateSepayOrderBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { productId } = body

  if (!productId) {
    return NextResponse.json({ error: 'Missing productId' }, { status: 400 })
  }

  // Fetch price server-side from Payload — never trust client-supplied price
  const payload = await getPayload({ config })
  const product = await payload.findByID({
    collection: 'products',
    id: productId,
    depth: 0,
  })

  if (!product || product.status !== 'published') {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  const orderId = await createOrder({
    userId: session.user.id,
    productId,
    productName: typeof product.name === 'string' ? product.name : String(product.name),
    price: product.priceVND,
    currency: 'VND',
    paymentMethod: 'sepay',
  })

  return NextResponse.json({ orderId })
}
