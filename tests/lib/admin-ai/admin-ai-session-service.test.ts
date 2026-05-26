import { describe, expect, it, vi } from 'vitest'
import {
  appendAdminAiSessionTurn,
  deleteAdminAiSession,
  getAdminAiSession,
  listAdminAiSessions,
  replaceAdminAiSessionMessages,
} from '@/lib/admin-ai/admin-ai-session-service'

describe('admin AI session service', () => {
  it('lists only sessions owned by the current admin', async () => {
    const payload = {
      find: vi.fn().mockResolvedValue({ docs: [] }),
      findByID: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }

    await listAdminAiSessions(payload, { id: 'admin-1' })

    expect(payload.find).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'admin-ai-sessions',
      where: { adminUserId: { equals: 'admin-1' } },
      sort: '-lastMessageAt',
    }))
  })

  it('creates a titled session from the first persisted user message', async () => {
    const payload = {
      find: vi.fn(),
      findByID: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      create: vi.fn((args) => Promise.resolve({ id: 11, ...args.data, createdAt: args.data.lastMessageAt })),
    }

    const session = await appendAdminAiSessionTurn(payload, { id: 'admin-1', email: 'a@example.com' }, {
      model: 'gpt-test',
      profileId: 'profile-1',
      userMessage: { id: 'u1', role: 'user', body: 'Kiểm tra site health hôm nay', createdAt: 'now' },
      assistantMessage: { id: 'a1', role: 'assistant', body: 'OK', createdAt: 'now' },
    })

    expect(session).toMatchObject({ id: '11', title: 'Kiểm tra site health hôm nay', messageCount: 2 })
    expect(payload.create).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'admin-ai-sessions',
      data: expect.objectContaining({ adminUserId: 'admin-1', profileId: 'profile-1', model: 'gpt-test' }),
    }))
  })

  it('rejects deleting a session owned by another admin', async () => {
    const payload = {
      find: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByID: vi.fn().mockResolvedValue({
        id: 12,
        adminUserId: 'admin-1',
        title: 'Other session',
        messages: [],
        lastMessageAt: '2026-05-25T00:00:00.000Z',
      }),
    }

    await expect(deleteAdminAiSession(payload, { id: 'admin-2' }, '12')).rejects.toThrow('another admin')
    expect(payload.delete).not.toHaveBeenCalled()
  })

  it('returns a controlled not found error when the session is missing', async () => {
    const payload = {
      find: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByID: vi.fn().mockRejectedValue(new Error('not found')),
    }

    await expect(getAdminAiSession(payload, { id: 'admin-1' }, '404')).rejects.toThrow('not found')
  })

  it('replaces messages only after owner verification', async () => {
    const payload = {
      find: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      findByID: vi.fn().mockResolvedValue({
        id: 12,
        adminUserId: 'admin-1',
        title: 'Owned session',
        messages: [],
        lastMessageAt: '2026-05-25T00:00:00.000Z',
      }),
      update: vi.fn((args) => Promise.resolve({ id: 12, title: 'Owned session', ...args.data })),
    }

    const session = await replaceAdminAiSessionMessages(payload, { id: 'admin-1' }, '12', [
      { id: 'a1', role: 'assistant', body: 'Done' },
    ])

    expect(session.messageCount).toBe(1)
    expect(payload.update).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'admin-ai-sessions',
      id: '12',
      data: expect.objectContaining({ messages: expect.any(Array) }),
    }))
  })
})
