import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}))

// Mock next/navigation — redirect throws so callers can detect it
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  }),
}))

// Mock auth config with controllable getSession
const mockGetSession = vi.fn()

vi.mock('@/lib/auth/auth-config', () => ({
  getAuth: () => ({
    api: {
      getSession: mockGetSession,
    },
  }),
}))

describe('auth-helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset module registry so each test gets a fresh import with current mocks
    vi.resetModules()
  })

  it('getSession returns null when no session exists', async () => {
    mockGetSession.mockResolvedValueOnce(null)

    const { getSession } = await import('@/lib/auth/auth-helpers')
    const session = await getSession()

    expect(session).toBeNull()
  })

  it('getSession returns session data when authenticated', async () => {
    const mockSession = {
      user: { id: 'user-1', email: 'test@test.com', name: 'Test User', role: 'user' },
      session: { id: 'sess-1', token: 'tok' },
    }
    mockGetSession.mockResolvedValueOnce(mockSession)

    const { getSession } = await import('@/lib/auth/auth-helpers')
    const session = await getSession()

    expect(session?.user.id).toBe('user-1')
    expect(session?.user.email).toBe('test@test.com')
  })

  it('requireAuth redirects to shared login with Vietnamese callback when not authenticated', async () => {
    mockGetSession.mockResolvedValueOnce(null)

    const { requireAuth } = await import('@/lib/auth/auth-helpers')
    await expect(requireAuth('vi')).rejects.toThrow('REDIRECT:/login?callbackUrl=/vi/profile')
  })

  it('requireAuth redirects to shared login with English callback', async () => {
    mockGetSession.mockResolvedValueOnce(null)

    const { requireAuth } = await import('@/lib/auth/auth-helpers')
    await expect(requireAuth('en')).rejects.toThrow('REDIRECT:/login?callbackUrl=/en/profile')
  })

  it('requireAuth returns session when authenticated', async () => {
    const mockSession = {
      user: { id: 'user-2', email: 'admin@test.com', name: 'Admin', role: 'admin' },
      session: { id: 'sess-2', token: 'tok2' },
    }
    mockGetSession.mockResolvedValueOnce(mockSession)

    const { requireAuth } = await import('@/lib/auth/auth-helpers')
    const session = await requireAuth('vi')

    expect(session.user.id).toBe('user-2')
  })

  it('requireAdmin redirects non-admin user to home', async () => {
    const mockSession = {
      user: { id: 'user-3', email: 'user@test.com', name: 'User', role: 'user' },
      session: { id: 'sess-3', token: 'tok3' },
    }
    // requireAdmin calls requireAuth which calls getSession
    mockGetSession.mockResolvedValueOnce(mockSession)

    const { requireAdmin } = await import('@/lib/auth/auth-helpers')
    await expect(requireAdmin('vi')).rejects.toThrow('REDIRECT:/vi')
  })

  it('requireAdmin returns session for admin user', async () => {
    const mockSession = {
      user: { id: 'user-4', email: 'admin@test.com', name: 'Admin', role: 'admin' },
      session: { id: 'sess-4', token: 'tok4' },
    }
    mockGetSession.mockResolvedValueOnce(mockSession)

    const { requireAdmin } = await import('@/lib/auth/auth-helpers')
    const session = await requireAdmin('vi')

    expect(session.user.role).toBe('admin')
  })
})
