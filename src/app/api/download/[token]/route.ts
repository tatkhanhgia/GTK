import { NextRequest, NextResponse } from 'next/server'
import { validateDownloadToken } from '@/lib/payment/download-token'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Secure file download endpoint.
 * Validates DB-stored opaque token before serving the file.
 * Returns 410 Gone for invalid/expired tokens.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const tokenRecord = await validateDownloadToken(token)
  if (!tokenRecord) {
    return new NextResponse('Invalid or expired download link', { status: 410 })
  }

  // Fetch product download file from Payload CMS
  const payload = await getPayload({ config })
  const product = await payload.findByID({
    collection: 'products',
    id: tokenRecord.product_id,
    depth: 1,
  })

  if (!product?.downloadFile) {
    return new NextResponse('File not found', { status: 404 })
  }

  const file = product.downloadFile as { url?: string; filename?: string }

  if (!file.url) {
    return new NextResponse('File URL missing', { status: 404 })
  }

  // Redirect to file URL served from Payload media storage.
  // In production, replace with signed cloud storage URLs (S3, GCS, etc.)
  return NextResponse.redirect(new URL(file.url, request.url))
}
