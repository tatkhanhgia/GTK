import { NextResponse } from 'next/server'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'
import { validateDownloadToken } from '@/lib/payment/download-token'
import { getPayload } from 'payload'
import config from '@payload-config'

const PRIVATE_DOWNLOAD_STORAGE_DIR = path.resolve(process.cwd(), 'digital-downloads')
const LEGACY_MEDIA_STORAGE_DIR = path.resolve(process.cwd(), 'public/media')
interface DownloadAsset {
  filename?: string | null
  filesize?: number | string | null
  mimeType?: string | null
  url?: string | null
}

function resolveStoredFilePath(storageDir: string, filename: string) {
  const safeFilename = path.basename(filename)
  if (safeFilename !== filename) {
    return null
  }

  const absolutePath = path.resolve(storageDir, safeFilename)
  if (
    absolutePath !== storageDir &&
    !absolutePath.startsWith(`${storageDir}${path.sep}`)
  ) {
    return null
  }

  return { absolutePath, safeFilename }
}

function resolveLegacyStoredFilePath(file: DownloadAsset) {
  if (!file.filename || !file.url?.startsWith('/media/')) {
    return null
  }

  return resolveStoredFilePath(LEGACY_MEDIA_STORAGE_DIR, file.filename)
}

/**
 * Secure file download endpoint.
 * Validates DB-stored opaque token before serving the file.
 * Returns 410 Gone for invalid/expired tokens.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const tokenRecord = await validateDownloadToken(token)
  if (!tokenRecord) {
    return new NextResponse('Invalid or expired download link', { status: 410 })
  }

  const payload = await getPayload({ config })
  const product = await payload.findByID({
    collection: 'products',
    id: tokenRecord.product_id,
    depth: 0,
    overrideAccess: true,
  })

  if (!product?.downloadFile) {
    return new NextResponse('File not found', { status: 404 })
  }

  const downloadFileId =
    typeof product.downloadFile === 'object' && product.downloadFile !== null
      ? product.downloadFile.id
      : product.downloadFile

  if (!downloadFileId) {
    return new NextResponse('File not found', { status: 404 })
  }

  const file = (await payload.findByID({
    collection: 'digital-downloads',
    id: downloadFileId,
    depth: 0,
    overrideAccess: true,
  })) as DownloadAsset

  if (!file.filename) {
    return new NextResponse('File metadata missing', { status: 404 })
  }

  const resolved = file.url?.startsWith('/media/')
    ? resolveLegacyStoredFilePath(file)
    : resolveStoredFilePath(PRIVATE_DOWNLOAD_STORAGE_DIR, file.filename)

  if (!resolved) {
    return new NextResponse('Invalid file path', { status: 404 })
  }

  try {
    const fileStats = await stat(resolved.absolutePath)
    const stream = Readable.toWeb(createReadStream(resolved.absolutePath)) as ReadableStream

    return new NextResponse(stream, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${encodeURIComponent(resolved.safeFilename)}"`,
        'Content-Length': String(file.filesize ?? fileStats.size),
        'Content-Type': file.mimeType || 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return new NextResponse('File not found', { status: 404 })
  }
}
