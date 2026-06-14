import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(
  join(process.cwd(), 'src/admin/styles/component-overrides.css'),
  'utf8',
)

describe('admin confirmation modal CSS', () => {
  it('styles Payload confirmation modals as polished admin overlays', () => {
    expect(css).toContain('.confirmation-modal__wrapper')
    expect(css).toContain('position: fixed !important')
    expect(css).toContain('border: 0 !important')
    expect(css).toContain('width: min(100%, 520px)')
    expect(css).toContain('backdrop-filter: blur(10px) saturate(0.96) !important')
    expect(css).toContain('.confirmation-modal__controls')
  })

  it('uses destructive treatment for delete confirmation variants', () => {
    expect(css).toContain(".confirmation-modal.delete-document #confirm-action")
    expect(css).toContain(".confirmation-modal[id^='perma-delete-'] #confirm-action")
    expect(css).toContain(".confirmation-modal[id$='confirm-delete-many-docs'] #confirm-action")
    expect(css).toContain(".confirmation-modal[id='confirm-empty-trash'] #confirm-action")
    expect(css).toContain('background: var(--admin-error) !important')
  })

  it('keeps delete-permanently options visible and mobile-safe', () => {
    expect(css).toContain('.confirmation-modal .delete-document__checkbox')
    expect(css).toContain('.confirmation-modal .delete-documents__checkbox')
    expect(css).toContain('@media (max-width: 560px)')
    expect(css).toContain('flex-direction: column-reverse')
  })
})
