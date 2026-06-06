import { describe, expect, it, vi } from 'vitest'
import {
  createAdminAiFileReference,
  deleteAdminAiFileReference,
} from '@/lib/admin-ai/files/admin-ai-file-storage-service'

function textFile(name: string, text: string) {
  const bytes = new TextEncoder().encode(text)
  return { name, type: 'text/plain', size: bytes.byteLength, arrayBuffer: () => Promise.resolve(bytes.buffer as ArrayBuffer) }
}

function createPayload({ numericIds = false } = {}) {
  const store: Record<string, Record<string, unknown>[]> = {
    'admin-ai-files': [],
    'admin-ai-file-references': [],
    'admin-ai-file-chunks': [],
  }
  let id = 1
  const matchesWhere = (doc: Record<string, unknown>, where?: Record<string, unknown>) => !where || Object.entries(where).every(([key, condition]) => {
    const expected = condition as { equals?: unknown; exists?: boolean }
    if ('equals' in expected) return String(doc[key]) === String(expected.equals)
    if ('exists' in expected) return expected.exists ? doc[key] !== undefined : doc[key] === undefined
    return true
  })
  return {
    store,
    create: vi.fn(async ({ collection, data }) => {
      const nextId = id++
      const doc = { id: numericIds ? nextId : String(nextId), ...data }
      store[collection].push(doc)
      return doc
    }),
    find: vi.fn(async ({ collection, where }) => ({ docs: store[collection].filter((doc) => matchesWhere(doc, where)) })),
    findByID: vi.fn(async ({ collection, id: docId }) => {
      const doc = store[collection].find((item) => String(item.id) === String(docId))
      if (!doc) throw new Error('not found')
      return doc
    }),
    update: vi.fn(async ({ collection, id: docId, data }) => {
      const doc = store[collection].find((item) => String(item.id) === String(docId))
      if (!doc) throw new Error('not found')
      Object.assign(doc, data)
      return doc
    }),
    delete: vi.fn(async ({ collection, id: docId }) => {
      store[collection] = store[collection].filter((item) => String(item.id) !== String(docId))
      return { ok: true }
    }),
  }
}

describe('admin AI file storage service', () => {
  it('dedupes identical content by checksum while creating separate references', async () => {
    const payload = createPayload()
    const adminUser = { id: 'admin-1', email: 'a@example.com' }

    const first = await createAdminAiFileReference({ payload, adminUser, file: textFile('a.md', '# Same') })
    const second = await createAdminAiFileReference({ payload, adminUser, file: textFile('b.md', '# Same') })

    expect(first.reused).toBe(false)
    expect(second.reused).toBe(true)
    expect(payload.store['admin-ai-files']).toHaveLength(1)
    expect(payload.store['admin-ai-file-references']).toHaveLength(2)
  })

  it('soft-deletes the reference and purges chunks when it is the last active reference', async () => {
    const payload = createPayload()
    const adminUser = { id: 'admin-1' }
    const created = await createAdminAiFileReference({ payload, adminUser, file: textFile('a.txt', 'hello') })

    await deleteAdminAiFileReference(payload, adminUser, created.attachment.referenceId)

    expect(payload.store['admin-ai-file-references'][0].deletedAt).toBeTruthy()
    expect(payload.store['admin-ai-files'][0].deletedAt).toBeTruthy()
    expect(payload.store['admin-ai-file-chunks']).toHaveLength(0)
  })

  it('allows the same file content to be uploaded again after soft delete', async () => {
    const payload = createPayload()
    const adminUser = { id: 'admin-1' }
    const first = await createAdminAiFileReference({ payload, adminUser, file: textFile('first.md', '# Repeat') })

    await deleteAdminAiFileReference(payload, adminUser, first.attachment.referenceId)
    const second = await createAdminAiFileReference({ payload, adminUser, file: textFile('second.md', '# Repeat') })

    expect(second.reused).toBe(false)
    expect(payload.store['admin-ai-files']).toHaveLength(2)
    expect(payload.store['admin-ai-files'][0].deletedAt).toBeTruthy()
    expect(payload.store['admin-ai-files'][1].deletedAt).toBeUndefined()
    expect(payload.store['admin-ai-file-references']).toHaveLength(2)
    expect(payload.store['admin-ai-file-references'][1].id).toBe(second.attachment.referenceId)
  })

  it('preserves numeric Payload ids when writing file relationship fields', async () => {
    const payload = createPayload({ numericIds: true })
    const adminUser = { id: 'admin-1' }

    await createAdminAiFileReference({ payload, adminUser, file: textFile('numeric.md', '# Numeric') })

    expect(payload.store['admin-ai-file-chunks'][0].file).toBe(1)
    expect(payload.store['admin-ai-file-references'][0].file).toBe(1)
  })

  it('backfills missing chunks when reusing a previously created file record', async () => {
    const payload = createPayload({ numericIds: true })
    const adminUser = { id: 'admin-1' }

    payload.store['admin-ai-files'].push({
      id: 9,
      checksum: 'ac1e355a0547006fe78da98c14b02f320ef96b3a33f071e19ea3308669a4bfd8',
      originalFilename: 'broken.md',
      mimeType: 'text/plain',
      byteSize: 9,
      status: 'ready',
    })

    const result = await createAdminAiFileReference({ payload, adminUser, file: textFile('fixed.md', '# Broken') })

    expect(result.reused).toBe(true)
    expect(payload.store['admin-ai-files']).toHaveLength(1)
    expect(payload.store['admin-ai-file-chunks']).toHaveLength(1)
    expect(payload.store['admin-ai-file-chunks'][0]).toMatchObject({ file: 9, content: '# Broken' })
    expect(payload.store['admin-ai-file-references'][0].file).toBe(9)
  })

  it('recovers from checksum uniqueness collisions by re-reading the stored file', async () => {
    const payload = createPayload()
    const adminUser = { id: 'admin-1' }
    const originalCreate = payload.create
    let duplicateThrown = false

    payload.create = vi.fn(async (args: Parameters<typeof originalCreate>[0]) => {
      if (args.collection === 'admin-ai-files' && !duplicateThrown) {
        duplicateThrown = true
        payload.store['admin-ai-files'].push({
          id: '9',
          checksum: 'ac1e355a0547006fe78da98c14b02f320ef96b3a33f071e19ea3308669a4bfd8',
          originalFilename: 'winner.md',
          mimeType: 'text/plain',
          byteSize: 8,
          status: 'ready',
        })
        throw new Error('duplicate key value violates unique constraint "admin_ai_files_checksum_idx"')
      }
      return originalCreate(args)
    }) as typeof payload.create

    const result = await createAdminAiFileReference({ payload, adminUser, file: textFile('loser.md', '# Broken') })

    expect(result.reused).toBe(true)
    expect(payload.store['admin-ai-files']).toHaveLength(1)
    expect(payload.store['admin-ai-file-references']).toHaveLength(1)
    expect(payload.store['admin-ai-file-references'][0].file).toBe('9')
  })
})
