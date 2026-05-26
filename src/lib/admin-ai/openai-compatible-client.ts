import { AdminAiError, type AdminAiChatMessage } from './admin-ai-chat-contract'
import { getAdminAiBaseUrlPolicyMessage, isAllowedAdminAiBaseUrl } from './admin-ai-url-policy'
import { adminAiSystemPrompt } from './admin-ai-system-prompt'

export type OpenAiToolDefinition = {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

export type OpenAiToolCall = {
  id: string
  function: {
    name: string
    arguments: string
  }
}

export type OpenAiCompatibleChatResult = {
  content: string
  toolCalls: OpenAiToolCall[]
  usage?: {
    inputTokens?: number
    outputTokens?: number
    totalTokens?: number
  }
}

type CallOpenAiCompatibleChatArgs = {
  baseUrl: string
  apiKey: string
  model: string
  messages: AdminAiChatMessage[]
  systemPrompt?: string
  tools?: OpenAiToolDefinition[]
  timeoutMs?: number
  fetcher?: typeof fetch
}

type ProviderChoice = {
  message?: {
    content?: unknown
    tool_calls?: unknown
  }
}

type ProviderResponse = {
  choices?: ProviderChoice[]
  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
  }
  error?: string | { message?: string }
}

export function normalizeOpenAiChatUrl(baseUrl: string) {
  const trimmed = baseUrl.trim().replace(/\/+$/, '')
  const url = new URL(trimmed)
  if (!isAllowedAdminAiBaseUrl(url)) {
    throw new AdminAiError('BAD_REQUEST', getAdminAiBaseUrlPolicyMessage())
  }
  if (url.pathname.endsWith('/chat/completions')) {
    return url.toString()
  }
  const basePath = url.pathname.replace(/\/+$/, '')
  url.pathname = basePath ? `${basePath}/chat/completions` : '/v1/chat/completions'
  return url.toString()
}

function parseToolCalls(value: unknown): OpenAiToolCall[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const call = item as { id?: unknown; function?: { name?: unknown; arguments?: unknown } }
    if (typeof call.id !== 'string' || typeof call.function?.name !== 'string') return []
    return [{
      id: call.id,
      function: {
        name: call.function.name,
        arguments: typeof call.function.arguments === 'string' ? call.function.arguments : '{}',
      },
    }]
  })
}

function readContentPartText(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (!value || typeof value !== 'object') return []

  const part = value as { text?: unknown }
  if (typeof part.text === 'string') return [part.text]
  if (part.text && typeof part.text === 'object') {
    const nestedText = (part.text as { value?: unknown }).value
    if (typeof nestedText === 'string') return [nestedText]
  }
  return []
}

function readProviderMessageContent(value: unknown) {
  if (typeof value === 'string') return value
  if (!Array.isArray(value)) return ''
  return value.flatMap(readContentPartText).filter(Boolean).join('\n').trim()
}

function readProviderErrorMessage(error: ProviderResponse['error']) {
  if (typeof error === 'string') return error
  return typeof error?.message === 'string' ? error.message : undefined
}

export async function callOpenAiCompatibleChat(args: CallOpenAiCompatibleChatArgs): Promise<OpenAiCompatibleChatResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), args.timeoutMs ?? 30000)

  try {
    const response = await (args.fetcher ?? fetch)(normalizeOpenAiChatUrl(args.baseUrl), {
      method: 'POST',
      signal: controller.signal,
      headers: {
        authorization: `Bearer ${args.apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: args.model,
        messages: [{ role: 'system', content: args.systemPrompt || adminAiSystemPrompt }, ...args.messages],
        tools: args.tools,
        tool_choice: args.tools?.length ? 'auto' : undefined,
      }),
    })

    const payload = await response.json().catch(() => ({})) as ProviderResponse
    const providerError = readProviderErrorMessage(payload.error)
    if (!response.ok || providerError) {
      throw new AdminAiError(
        'PROVIDER_ERROR',
        providerError || 'AI provider request failed.',
        response.ok ? 502 : response.status,
      )
    }

    const message = payload.choices?.[0]?.message
    return {
      content: readProviderMessageContent(message?.content),
      toolCalls: parseToolCalls(message?.tool_calls),
      usage: payload.usage ? {
        inputTokens: payload.usage.prompt_tokens,
        outputTokens: payload.usage.completion_tokens,
        totalTokens: payload.usage.total_tokens,
      } : undefined,
    }
  } catch (error) {
    if (error instanceof AdminAiError) throw error
    if (error instanceof Error && error.name === 'AbortError') {
      throw new AdminAiError('TIMEOUT', 'AI provider request timed out.', 504)
    }
    throw new AdminAiError('PROVIDER_ERROR', 'AI provider request failed.', 502)
  } finally {
    clearTimeout(timeout)
  }
}
