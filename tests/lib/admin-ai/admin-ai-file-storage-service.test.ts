import { describe, expect, it, vi } from 'vitest'
import {
  createAdminAiFileReference,
  deleteAdminAiFileReference,
} from '@/lib/admin-ai/files/admin-ai-file-storage-service'

function textFile(name: string, text: string) {
  const bytes = new TextEncoder().encode(text)
  return { name, type: 'text/plain', size: bytes.byteLength, arrayBuffer: () => Promise.resolve(bytes.buffer as ArrayBuffer) }
}

function createPayload() {
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
      const doc = { id: String(id++), ...data }
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
})
