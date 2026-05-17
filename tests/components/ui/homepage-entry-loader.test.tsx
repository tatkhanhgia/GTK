import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HomepageEntryLoader } from '@/components/ui/homepage-entry-loader'

describe('HomepageEntryLoader', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    window.sessionStorage.clear()
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    window.sessionStorage.clear()
    vi.restoreAllMocks()
  })

  it('shows once and persists the display for the browser session', () => {
    const { unmount } = render(<HomepageEntryLoader locale="en" />)

    expect(screen.getByRole('status', { name: 'Opening GTKBlog' })).toBeInTheDocument()
    expect(window.sessionStorage.getItem('gtkblog.homepageEntryLoader.seen')).toBe('true')

    unmount()
    render(<HomepageEntryLoader locale="en" />)

    expect(screen.queryByRole('status', { name: 'Opening GTKBlog' })).not.toBeInTheDocument()
  })

  it('still renders when session storage is blocked', () => {
    const storageError = Object.assign(new Error('Access denied'), { name: 'SecurityError' })

    vi.spyOn(window.sessionStorage, 'getItem').mockImplementation(() => {
      throw storageError
    })
    vi.spyOn(window.sessionStorage, 'setItem').mockImplementation(() => {
      throw storageError
    })

    render(<HomepageEntryLoader locale="en" />)

    expect(screen.getByRole('status', { name: 'Opening GTKBlog' })).toBeInTheDocument()
  })
})
