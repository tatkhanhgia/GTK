import React from 'react'
import { readFileSync } from 'fs'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  callbackUrl: '/en/profile' as string | null,
  signInEmail: vi.fn(),
  signInSocial: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'callbackUrl' ? mocks.callbackUrl : null),
  }),
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

vi.mock('@/lib/auth/auth-client', () => ({
  signIn: {
    email: mocks.signInEmail,
    social: mocks.signInSocial,
  },
}))

import LoginPage from '@/app/(auth)/login/page'

describe('LoginPage', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    mocks.callbackUrl = '/en/profile'
  })

  it('returns email sign-in users to the callback URL', async () => {
    mocks.signInEmail.mockResolvedValueOnce({})
    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'user@example.com' } })
    fireEvent.change(screen.getByLabelText(/kh/i), { target: { value: 'password123' } })
    fireEvent.submit(screen.getByLabelText(/Email/i).closest('form')!)

    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith('/en/profile'))
    expect(mocks.refresh).toHaveBeenCalled()
  })

  it('passes callback URL to social sign-in', () => {
    render(<LoginPage />)

    fireEvent.click(screen.getByText(/Google/i))

    expect(mocks.signInSocial).toHaveBeenCalledWith({ provider: 'google', callbackURL: '/en/profile' })
  })

  it('falls back to Vietnamese home for unsafe callback URLs', async () => {
    mocks.callbackUrl = 'https://example.com/phish'
    mocks.signInEmail.mockResolvedValueOnce({})
    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'user@example.com' } })
    fireEvent.change(screen.getByLabelText(/kh/i), { target: { value: 'password123' } })
    fireEvent.submit(screen.getByLabelText(/Email/i).closest('form')!)

    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith('/vi'))
  })

  it('keeps useSearchParams behind a Suspense boundary for static builds', () => {
    const source = readFileSync('src/app/(auth)/login/page.tsx', 'utf8')

    expect(source).toContain('<Suspense fallback={<LoginCardShell />}>')
    expect(source).toContain('function LoginContent()')
  })
})
