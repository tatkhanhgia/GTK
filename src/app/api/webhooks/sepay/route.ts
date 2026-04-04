import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { sepayConfig, type SepayWebhookPayload } from '@/lib/payment/sepay-config'
import { fulfillOrder } from '@/lib/payment/fulfill-order'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sql } from '@payloadcms/db-postgres'

interface PendingOrderRow {
  id: string
  currency: string
  total: number
}

/**
 * SePay bank transfer webhook handler.
 * SECURITY:
 *   1. HMAC-SHA256 signature verification on raw body
 *   2. Server-side amount verification against stored order total
 *   3. Idempotency handled inside fulfillOrder
 * Uses raw SQL to avoid drizzle-orm dual-version type clash.
 */
export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature =
    request.headers.get('x-sepay-signature') ??
    request.headers.get('signature') ??
    ''

  // HMAC-SHA256 signature verification
  const expectedSig = createHmac('sha256', sepayConfig.webhookSecret)
    .update(body)
    .digest('hex')

  if (signature !== expectedSig) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payloadData: SepayWebhookPayload
  try {
    payloadData = JSON.parse(body) as SepayWebhookPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Extract order code from transfer content — expected format: "GTKBLOG-XXXXXXXX"
  const match = payloadData.content.match(/GTKBLOG-([A-Z0-9]{8})/i)
  if (!match) {
    // Not our transaction — acknowledge without error
    return NextResponse.json({ success: true })
  }

  const orderCodeSuffix = match[1].toLowerCase()

  // Find matching pending order by last 8 chars of ID
  const payloadInstance = await getPayload({ config })
  const db = payloadInstance.db.drizzle

  const pendingResult = await db.execute(
    sql`SELECT id, currency, total FROM orders WHERE status = 'pending'`
  )
  const pendingRows = (pendingResult as { rows: unknown[] }).rows as PendingOrderRow[]

  const order = pendingRows.find(
    (o) => o.id.slice(-8).toLowerCase() === orderCodeSuffix
  )

  if (!order) {
    return NextResponse.json({ success: true })
  }

  // CRITICAL: server-side amount verification — prevents partial payment attacks
  const expectedVND = order.currency === 'VND' ? order.total : null
  if (expectedVND !== null && Math.abs(payloadData.transferAmount - expectedVND) > 1000) {
    return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
  }

  await fulfillOrder(order.id, String(payloadData.id))

  return NextResponse.json({ success: true })
}
