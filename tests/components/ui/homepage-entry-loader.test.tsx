import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import Link from 'next/link'
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

  it('shows on every homepage mount', () => {
    const { unmount } = render(<HomepageEntryLoader locale="en" />)

    expect(screen.getByRole('status', { name: 'Opening GTKBlog' })).toBeInTheDocument()

    unmount()
    render(<HomepageEntryLoader locale="en" />)

    expect(screen.getByRole('status', { name: 'Opening GTKBlog' })).toBeInTheDocument()
  })

  it('restarts when the current homepage link is clicked', () => {
    render(
      <>
        <HomepageEntryLoader locale="en" />
        <Link href="/en">Home</Link>
      </>,
    )

    expect(screen.getByRole('status', { name: 'Opening GTKBlog' })).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(520)
    })

    expect(screen.queryByRole('status', { name: 'Opening GTKBlog' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('link', { name: 'Home' }))

    expect(screen.getByRole('status', { name: 'Opening GTKBlog' })).toBeInTheDocument()
  })

  it('keeps the shorter duration for reduced motion', () => {
    render(<HomepageEntryLoader locale="en" />)

    act(() => {
      vi.advanceTimersByTime(519)
    })

    expect(screen.getByRole('status', { name: 'Opening GTKBlog' })).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1)
    })

    expect(screen.queryByRole('status', { name: 'Opening GTKBlog' })).not.toBeInTheDocument()
  })
})
