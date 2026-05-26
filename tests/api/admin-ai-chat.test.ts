import { beforeEach, describe, expect, it, vi } from 'vitest'

const authState = vi.hoisted(() => ({
  user: null as unknown,
  payload: {},
}))

const chatMocks = vi.hoisted(() => ({
  resolveProfile: vi.fn(),
  callProvider: vi.fn(),
  appendSession: vi.fn(),
  loadAttachmentContext: vi.fn(),
}))

vi.mock('@/lib/admin/payload-admin-api-auth', () => ({
  requirePayloadAdminApi: vi.fn(() => Promise.resolve(authState)),
}))

vi.mock('@/lib/admin-ai/admin-ai-profile-service', () => ({
  resolveAdminAiProfile: chatMocks.resolveProfile,
}))

vi.mock('@/lib/admin-ai/openai-compatible-client', () => ({
  callOpenAiCompatibleChat: chatMocks.callProvider,
}))

vi.mock('@/lib/admin-ai/admin-ai-tool-registry', () => ({
  getAdminAiToolDefinitions: vi.fn(() => []),
  handleAdminAiToolCalls: vi.fn(() => Promise.resolve({ pendingActions: [], toolResults: [] })),
}))

vi.mock('@/lib/admin-ai/admin-ai-session-service', () => ({
  appendAdminAiSessionTurn: chatMocks.appendSession,
}))

vi.mock('@/lib/admin-ai/files/admin-ai-file-context-service', () => ({
  loadAdminAiAttachmentContext: chatMocks.loadAttachmentContext,
}))

describe('admin AI chat API', () => {
  beforeEach(() => {
    authState.user = null
    authState.payload = {}
    vi.clearAllMocks()
    chatMocks.resolveProfile.mockResolvedValue({
      id: 'profile-1',
      baseUrl: 'https://api.openai.com/v1',
      apiKey: 'key',
      defaultModel: 'gpt-test',
      modelOptions: [],
    })
    chatMocks.callProvider.mockResolvedValue({ content: 'done', toolCalls: [], usage: {} })
    chatMocks.appendSession.mockResolvedValue({ id: 'session-1', messages: [] })
    chatMocks.loadAttachmentContext.mockResolvedValue({
      attachments: [{ referenceId: 'ref-1', filename: 'outline.md', status: 'ready' }],
      contextMessage: 'Attachment: outline.md\nHello from file',
    })
  })

  it('rejects unauthenticated requests with JSON 401', async () => {
    const { POST } = await import('@/app/api/admin/ai/chat/route')
    const response = await POST(new Request('https://app.test/api/admin/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] }),
    }))

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toMatchObject({ error: { code: 'UNAUTHORIZED' } })
  })

  it('injects last user attachment context into the provider request and persists metadata', async () => {
    authState.user = { id: 'admin-1', role: 'admin' }
    const { POST } = await import('@/app/api/admin/ai/chat/route')

    const response = await POST(new Request('https://app.test/api/admin/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'session-1',
        messages: [{ role: 'user', content: 'Draft article', attachmentIds: ['ref-1'] }],
      }),
    }))

    expect(response.status).toBe(200)
    expect(chatMocks.loadAttachmentContext).toHaveBeenCalledWith(expect.objectContaining({
      adminUser: authState.user,
      attachmentIds: ['ref-1'],
      sessionId: 'session-1',
    }))
    expect(chatMocks.callProvider).toHaveBeenCalledWith(expect.objectContaining({
      messages: [expect.objectContaining({ content: expect.stringContaining('Hello from file') })],
    }))
    expect(chatMocks.appendSession).toHaveBeenCalledWith(expect.anything(), authState.user, expect.objectContaining({
      userMessage: expect.objectContaining({
        body: 'Draft article',
        attachments: [expect.objectContaining({ referenceId: 'ref-1' })],
      }),
    }))
  })

  it('rejects empty provider responses before persisting a fallback assistant message', async () => {
    authState.user = { id: 'admin-1', role: 'admin' }
    chatMocks.callProvider.mockResolvedValueOnce({ content: '', toolCalls: [], usage: {} })
    const { POST } = await import('@/app/api/admin/ai/chat/route')

    const response = await POST(new Request('https://app.test/api/admin/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Say something useful' }],
      }),
    }))

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'PROVIDER_ERROR', message: 'AI provider returned an empty response.' },
    })
    expect(chatMocks.appendSession).not.toHaveBeenCalled()
  })
})
