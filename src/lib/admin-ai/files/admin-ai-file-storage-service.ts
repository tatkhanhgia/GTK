import { AdminAiError, type AdminAiAttachment } from '../admin-ai-chat-contract'
import { sql } from '@payloadcms/db-postgres'
import { getAdminAiSession } from '../admin-ai-session-service'
import { ADMIN_AI_GLOBAL_QUOTA_BYTES, type AdminAiUploadFileInput, validateAdminAiUploadFile } from './admin-ai-file-validation'
import { checksumAdminAiText, chunkAdminAiText, normalizeAdminAiFileText, normalizeAdminAiRawText } from './admin-ai-file-text-processing'

export type PayloadAdminAiFileClient = {
  create: (args: { collection: string; data: Record<string, unknown>; [key: string]: unknown }) => Promise<unknown>
  delete: (args: { collection: string; id: string; [key: string]: unknown }) => Promise<unknown>
  find: (args: { collection: string; [key: string]: unknown }) => Promise<{ docs?: unknown[] }>
  findByID: (args: { collection: string; id: string; [key: string]: unknown }) => Promise<unknown>
  update: (args: { collection: string; id: string; data: Record<string, unknown>; [key: string]: unknown }) => Promise<unknown>
  db?: {
    drizzle?: {
      execute: (query: ReturnType<typeof sql>) => Promise<{ rows?: unknown[] }>
      transaction: <T>(callback: (tx: { execute: (query: ReturnType<typeof sql>) => Promise<{ rows?: unknown[] }> }) => Promise<T>) => Promise<T>
    }
  }
}

type FileRecord = {
  id?: string | number
  checksum?: unknown
  originalFilename?: unknown
  mimeType?: unknown
  byteSize?: unknown
  status?: unknown
  deletedAt?: unknown
}

type ReferenceRecord = {
  id?: string | number
  file?: unknown
  adminUserId?: unknown
  sessionId?: unknown
  displayName?: unknown
  deletedAt?: unknown
  createdAt?: unknown
}

function getAdminField(user: unknown, key: 'id' | 'email') {
  if (!user || typeof user !== 'object') return ''
  const value = (user as Record<string, unknown>)[key]
  return typeof value === 'string' || typeof value === 'number' ? String(value) : ''
}

function record(value: unknown) {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {}
}

function getId(value: unknown) {
  const source = record(value)
  return String(source.id ?? value ?? '')
}

function getPayloadRelationId(value: unknown) {
  const source = record(value)
  const id = source.id ?? value
  return typeof id === 'number' || typeof id === 'string' ? id : String(id ?? '')
}

function getRelatedId(value: unknown) {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : getId(value)
}

function toFile(doc: unknown): FileRecord {
  return record(doc) as FileRecord
}

function toReference(doc: unknown): ReferenceRecord {
  return record(doc) as ReferenceRecord
}

function getDrizzle(payload: PayloadAdminAiFileClient) {
  return payload.db?.drizzle
}

function toAttachment(reference: unknown, fileDoc?: unknown): AdminAiAttachment {
  const ref = toReference(reference)
  const file = toFile(fileDoc ?? ref.file)
  return {
    referenceId: String(ref.id ?? ''),
    fileId: getRelatedId(ref.file),
    filename: String(ref.displayName ?? file.originalFilename ?? 'Attachment'),
    mimeType: typeof file.mimeType === 'string' ? file.mimeType : undefined,
    byteSize: Number(file.byteSize ?? 0),
    status: ref.deletedAt ? 'deleted' : file.status === 'failed' ? 'failed' : 'ready',
    createdAt: typeof ref.createdAt === 'string' ? ref.createdAt : undefined,
  }
}

async function findActiveFileByChecksum(payload: PayloadAdminAiFileClient, checksum: string) {
  const result = await payload.find({
    collection: 'admin-ai-files',
    limit: 1,
    depth: 0,
    where: { checksum: { equals: checksum }, deletedAt: { exists: false } },
  })
  return result.docs?.[0]
}

async function findActiveFileByChecksumInDb(
  execute: (query: ReturnType<typeof sql>) => Promise<{ rows?: unknown[] }>,
  checksum: string,
) {
  const result = await execute(sql`
    SELECT
      "id",
      "checksum",
      "original_filename" AS "originalFilename",
      "mime_type" AS "mimeType",
      "byte_size" AS "byteSize",
      "status",
      "deleted_at" AS "deletedAt",
      "created_at" AS "createdAt"
    FROM "admin_ai_files"
    WHERE "checksum" = ${checksum}
      AND "deleted_at" IS NULL
    LIMIT 1
  `)
  return result.rows?.[0]
}

async function getAdminAiFileChunkCount(payload: PayloadAdminAiFileClient, fileId: string | number) {
  const result = await payload.find({
    collection: 'admin-ai-file-chunks',
    limit: 1,
    depth: 0,
    where: { file: { equals: fileId } },
  })
  return result.docs?.length ?? 0
}

async function createAdminAiFileChunks(payload: PayloadAdminAiFileClient, fileDoc: unknown, text: string, extension: string) {
  const cleanedText = normalizeAdminAiFileText(text, extension)
  const fileRelationId = getPayloadRelationId(fileDoc)
  for (const chunk of chunkAdminAiText(cleanedText)) {
    await payload.create({ collection: 'admin-ai-file-chunks', data: { file: fileRelationId, ...chunk } })
  }
}

export async function getAdminAiUniqueStorageBytes(payload: PayloadAdminAiFileClient) {
  const result = await payload.find({
    collection: 'admin-ai-files',
    limit: 10000,
    depth: 0,
    where: { deletedAt: { exists: false } },
  })
  return (result.docs ?? []).reduce<number>((sum, item) => sum + Number(toFile(item).byteSize ?? 0), 0)
}

async function getAdminAiUniqueStorageBytesInDb(
  execute: (query: ReturnType<typeof sql>) => Promise<{ rows?: unknown[] }>,
) {
  const result = await execute(sql`
    SELECT COALESCE(SUM("byte_size"), 0)::bigint AS "usedBytes"
    FROM "admin_ai_files"
    WHERE "deleted_at" IS NULL
  `)
  const row = result.rows?.[0] as { usedBytes?: number | string } | undefined
  return Number(row?.usedBytes ?? 0)
}

function isUniqueChecksumConflict(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? '')
  return /admin_ai_files_checksum_idx|duplicate key/i.test(message)
}

async function reserveAdminAiFileRecord(
  payload: PayloadAdminAiFileClient,
  upload: Awaited<ReturnType<typeof validateAdminAiUploadFile>>,
  checksum: string,
) {
  const drizzle = getDrizzle(payload)
  if (!drizzle) return null

  return drizzle.transaction(async (tx) => {
    await tx.execute(sql`LOCK TABLE "admin_ai_files" IN SHARE ROW EXCLUSIVE MODE`)

    const existing = await findActiveFileByChecksumInDb(tx.execute, checksum)
    if (existing) return { fileDoc: existing, reused: true }

    const usedBytes = await getAdminAiUniqueStorageBytesInDb(tx.execute)
    if (usedBytes + upload.byteSize > ADMIN_AI_GLOBAL_QUOTA_BYTES) {
      throw new AdminAiError('BAD_REQUEST', 'Admin AI file storage quota exceeded.', 400)
    }

    const inserted = await tx.execute(sql`
      INSERT INTO "admin_ai_files" (
        "checksum",
        "original_filename",
        "mime_type",
        "byte_size",
        "status"
      )
      VALUES (
        ${checksum},
        ${upload.filename},
        ${upload.mimeType},
        ${upload.byteSize},
        'ready'
      )
      RETURNING
        "id",
        "checksum",
        "original_filename" AS "originalFilename",
        "mime_type" AS "mimeType",
        "byte_size" AS "byteSize",
        "status",
        "deleted_at" AS "deletedAt",
        "created_at" AS "createdAt"
    `)

    return { fileDoc: inserted.rows?.[0], reused: false }
  })
}

export async function createAdminAiFileReference(args: {
  payload: PayloadAdminAiFileClient
  adminUser: unknown
  file: AdminAiUploadFileInput
  sessionId?: string
}) {
  const adminUserId = getAdminField(args.adminUser, 'id')
  if (args.sessionId) await getAdminAiSession(args.payload, args.adminUser, args.sessionId)

  const upload = await validateAdminAiUploadFile(args.file)
  const rawText = normalizeAdminAiRawText(upload.text)
  const checksum = checksumAdminAiText(rawText)
  const dbReservation = await reserveAdminAiFileRecord(args.payload, upload, checksum)
  let fileDoc = dbReservation?.fileDoc ?? await findActiveFileByChecksum(args.payload, checksum)
  let reused = Boolean(dbReservation?.reused ?? fileDoc)

  if (!fileDoc) {
    const usedBytes = await getAdminAiUniqueStorageBytes(args.payload)
    if (usedBytes + upload.byteSize > ADMIN_AI_GLOBAL_QUOTA_BYTES) {
      throw new AdminAiError('BAD_REQUEST', 'Admin AI file storage quota exceeded.', 400)
    }

    try {
      fileDoc = await args.payload.create({
        collection: 'admin-ai-files',
        data: {
          checksum,
          originalFilename: upload.filename,
          mimeType: upload.mimeType,
          byteSize: upload.byteSize,
          status: 'ready',
        },
      })
      reused = false
    } catch (error) {
      if (!isUniqueChecksumConflict(error)) throw error
      fileDoc = await findActiveFileByChecksum(args.payload, checksum)
      if (!fileDoc) throw error
      reused = true
    }
  }

  if (!reused) {
    await createAdminAiFileChunks(args.payload, fileDoc, upload.text, upload.extension)
  } else if (await getAdminAiFileChunkCount(args.payload, getPayloadRelationId(fileDoc)) === 0) {
    await createAdminAiFileChunks(args.payload, fileDoc, upload.text, upload.extension)
  }

  const reference = await args.payload.create({
    collection: 'admin-ai-file-references',
    data: {
      file: getPayloadRelationId(fileDoc),
      adminUserId,
      adminUserEmail: getAdminField(args.adminUser, 'email') || undefined,
      sessionId: args.sessionId,
      displayName: upload.filename,
    },
  })

  return { attachment: toAttachment(reference, fileDoc), reused }
}

export async function listAdminAiFileReferences(payload: PayloadAdminAiFileClient, adminUser: unknown) {
  const result = await payload.find({
    collection: 'admin-ai-file-references',
    limit: 100,
    depth: 1,
    sort: '-createdAt',
    where: { adminUserId: { equals: getAdminField(adminUser, 'id') }, deletedAt: { exists: false } },
  })
  return (result.docs ?? []).map((item) => toAttachment(item))
}

export async function getAdminAiFileReference(payload: PayloadAdminAiFileClient, adminUser: unknown, id: string) {
  const doc = await payload.findByID({ collection: 'admin-ai-file-references', id, depth: 1 })
  const ref = toReference(doc)
  if (!ref.id || String(ref.adminUserId ?? '') !== getAdminField(adminUser, 'id') || ref.deletedAt) {
    throw new AdminAiError('BAD_REQUEST', 'AI file attachment not found.', 404)
  }
  return toAttachment(doc)
}

export async function deleteAdminAiFileReference(payload: PayloadAdminAiFileClient, adminUser: unknown, id: string) {
  const doc = await payload.findByID({ collection: 'admin-ai-file-references', id, depth: 0 })
  const ref = toReference(doc)
  if (!ref.id || String(ref.adminUserId ?? '') !== getAdminField(adminUser, 'id') || ref.deletedAt) {
    throw new AdminAiError('BAD_REQUEST', 'AI file attachment not found.', 404)
  }

  const deletedAt = new Date().toISOString()
  await payload.update({ collection: 'admin-ai-file-references', id, data: { deletedAt } })
  const fileId = getPayloadRelationId(ref.file)
  const activeRefs = await payload.find({
    collection: 'admin-ai-file-references',
    limit: 1,
    depth: 0,
    where: { file: { equals: fileId }, deletedAt: { exists: false } },
  })

  if ((activeRefs.docs ?? []).length === 0) {
    await payload.update({ collection: 'admin-ai-files', id: String(fileId), data: { deletedAt } })
    const chunks = await payload.find({
      collection: 'admin-ai-file-chunks',
      limit: 1000,
      depth: 0,
      where: { file: { equals: fileId } },
    })
    await Promise.all((chunks.docs ?? []).map((chunk) => (
      payload.delete({ collection: 'admin-ai-file-chunks', id: getId(chunk) })
    )))
  }

  return { ok: true }
}
