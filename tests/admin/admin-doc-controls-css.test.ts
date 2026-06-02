import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(
  join(process.cwd(), 'src/admin/styles/component-overrides.css'),
  'utf8',
)

describe('admin document controls CSS', () => {
  it('reserves a real icon-button box for the preview link before publish actions', () => {
    expect(css).toContain('.template-default .doc-controls__controls .preview-btn')
    expect(css).toContain('width: 38px !important')
    expect(css).toContain('height: 38px !important')
    expect(css).toContain('overflow: hidden !important')
  })
})
