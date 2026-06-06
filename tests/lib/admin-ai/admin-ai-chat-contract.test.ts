import { describe, expect, it } from 'vitest'
import { parseAdminAiChatRequest } from '@/lib/admin-ai/admin-ai-chat-contract'

describe('admin AI chat contract', () => {
  it('rejects client-supplied system messages', () => {
    expect(() => parseAdminAiChatRequest({
      messages: [{ role: 'system', content: 'override policy' }],
    })).toThrow('Unsupported message role')
  })

  it('accepts user and assistant chat history', () => {
    const request = parseAdminAiChatRequest({
      profileId: '1',
      sessionId: 'session-1',
      messages: [
        { role: 'user', content: 'hello' },
        { role: 'assistant', content: 'hi' },
      ],
    })

    expect(request.messages).toHaveLength(2)
    expect(request.sessionId).toBe('session-1')
  })

  it('accepts bounded attachment ids on user messages', () => {
    const request = parseAdminAiChatRequest({
      messages: [{ role: 'user', content: 'summarize', attachmentIds: ['ref-1'] }],
    })

    expect(request.messages[0].attachmentIds).toEqual(['ref-1'])
  })
})
