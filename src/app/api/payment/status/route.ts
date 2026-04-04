import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sql } from '@payloadcms/db-postgres'

/**
 * Payment status polling endpoint for SePay QR modal.
 * Client polls this every 5s to detect when bank transfer is confirmed.
 * Uses raw SQL to avoid drizzle-orm dual-version type clash.
 */
export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get('orderId')
  if (!orderId) {
    return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
  }

  const payload = await getPayload({ config })
  const db = payload.db.drizzle

  const result = await db.execute(
    sql`SELECT status FROM orders WHERE id = ${orderId} LIMIT 1`
  )

  const rows = (result as { rows: unknown[] }).rows
  if (!rows || rows.length === 0) {
    return NextResponse.json({ status: 'not_found' })
  }

  const row = rows[0] as { status: string }
  return NextResponse.json({ status: row.status })
}
