import { describe, expect, it, vi } from 'vitest'
import {
  callOpenAiCompatibleChat,
  normalizeOpenAiChatUrl,
} from '@/lib/admin-ai/openai-compatible-client'

describe('openai-compatible-client', () => {
  it('normalizes base URLs to chat completions endpoint', () => {
    expect(normalizeOpenAiChatUrl('https://api.openai.com/v1')).toBe('https://api.openai.com/v1/chat/completions')
    expect(normalizeOpenAiChatUrl('https://example.com/v1/chat/completions')).toBe('https://example.com/v1/chat/completions')
    expect(normalizeOpenAiChatUrl('http://localhost:1234')).toBe('http://localhost:1234/v1/chat/completions')
  })

  it('rejects non-local http provider URLs', () => {
    expect(() => normalizeOpenAiChatUrl('http://provider.test/v1')).toThrow('https')
    expect(normalizeOpenAiChatUrl('http://localhost:11434/v1')).toBe('http://localhost:11434/v1/chat/completions')
    expect(normalizeOpenAiChatUrl('http://172.20.16.1:1234/v1')).toBe('http://172.20.16.1:1234/v1/chat/completions')
  })

  it('sends bearer auth, model, system prompt, messages, and tools', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: 'ok', tool_calls: [] } }],
      usage: { prompt_tokens: 2, completion_tokens: 3, total_tokens: 5 },
    })))

    const result = await callOpenAiCompatibleChat({
      baseUrl: 'https://provider.test/v1',
      apiKey: 'sk-provider',
      model: 'gpt-test',
      systemPrompt: 'custom profile prompt',
      messages: [{ role: 'user', content: 'hello' }],
      tools: [{
        type: 'function',
        function: { name: 'site_health_read', description: 'read health', parameters: { type: 'object' } },
      }],
      fetcher,
    })

    const [, init] = fetcher.mock.calls[0]
    const body = JSON.parse(String(init.body))
    expect(init.headers.authorization).toBe('Bearer sk-provider')
    expect(body.model).toBe('gpt-test')
    expect(body.messages[0].role).toBe('system')
    expect(body.messages[0].content).toBe('custom profile prompt')
    expect(body.messages[1]).toEqual({ role: 'user', content: 'hello' })
    expect(body.tools[0].function.name).toBe('site_health_read')
    expect(result).toMatchObject({ content: 'ok', usage: { totalTokens: 5 } })
  })

  it('reads text from provider content parts', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      choices: [{
        message: {
          content: [
            { type: 'text', text: 'First line' },
            { type: 'text', text: 'Second line' },
          ],
        },
      }],
    })))

    const result = await callOpenAiCompatibleChat({
      baseUrl: 'https://provider.test/v1',
      apiKey: 'sk-provider',
      model: 'gpt-test',
      messages: [{ role: 'user', content: 'hello' }],
      fetcher,
    })

    expect(result.content).toBe('First line\nSecond line')
  })

  it('rejects provider error payloads even when HTTP status is ok', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      error: 'Unexpected endpoint or method. (POST /chat/completions)',
    }), { status: 200 }))

    await expect(callOpenAiCompatibleChat({
      baseUrl: 'https://provider.test/v1',
      apiKey: 'sk-provider',
      model: 'gpt-test',
      messages: [{ role: 'user', content: 'hello' }],
      fetcher,
    })).rejects.toThrow('Unexpected endpoint or method')
  })
})
