import React from 'react'
import { render, screen, cleanup } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  usePathname: () => '/en/blog',
}))

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode
    href: string
    [key: string]: unknown
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('@/components/ui/theme-toggle', () => ({
  ThemeToggle: () => <button type="button">Theme</button>,
}))

import { Navbar } from '@/components/layout/navbar'

describe('Navbar', () => {
  afterEach(() => {
    cleanup()
  })

  it('keeps the current locale when the logo navigates home', () => {
    render(<Navbar locale="en" />)

    expect(screen.getByRole('link', { name: /GTKBlog/i })).toHaveAttribute('href', '/en')
  })
})
