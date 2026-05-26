import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('database bootstrap schema guards', () => {
  it('keeps Admin AI file upload collections in Payload locked document relations', () => {
    const bootstrap = readFileSync('scripts/bootstrap-db.js', 'utf8')

    for (const requiredName of [
      'admin_ai_files',
      'admin_ai_file_references',
      'admin_ai_file_chunks',
      'admin_ai_files_id',
      'admin_ai_file_references_id',
      'admin_ai_file_chunks_id',
    ]) {
      expect(bootstrap).toContain(requiredName)
    }
  })
})
