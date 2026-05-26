import { NextResponse } from 'next/server'
import { requirePayloadAdminApi } from '@/lib/admin/payload-admin-api-auth'
import { AdminAiError, parseAdminAiChatRequest, type AdminAiChatResponse } from '@/lib/admin-ai/admin-ai-chat-contract'
import { resolveAdminAiProfile } from '@/lib/admin-ai/admin-ai-profile-service'
import { callOpenAiCompatibleChat } from '@/lib/admin-ai/openai-compatible-client'
import { getAdminAiToolDefinitions, handleAdminAiToolCalls } from '@/lib/admin-ai/admin-ai-tool-registry'
import { appendAdminAiSessionTurn } from '@/lib/admin-ai/admin-ai-session-service'
import { buildAdminAiSystemPrompt } from '@/lib/admin-ai/admin-ai-system-prompt'
import { loadAdminAiAttachmentContext } from '@/lib/admin-ai/files/admin-ai-file-context-service'

export const dynamic = 'force-dynamic'

function errorResponse(error: unknown) {
  if (error instanceof AdminAiError) {
    return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.status })
  }
  return NextResponse.json(
    { error: { code: 'PROVIDER_ERROR', message: 'AI chat request failed.' } },
    { status: 500 },
  )
}

function selectProfileModel(profile: { defaultModel: string; modelOptions: string[] }, requestedModel?: string) {
  const model = requestedModel || profile.defaultModel
  const allowed = new Set([profile.defaultModel, ...profile.modelOptions].filter(Boolean))
  if (!allowed.has(model)) {
    throw new AdminAiError('BAD_REQUEST', 'Selected model is not allowed by this profile.', 400)
  }
  return model
}

function getLastUserMessageIndex(messages: { role: string }[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index]?.role === 'user') return index
  }
  return -1
}

export async function POST(request: Request) {
  const { payload, user } = await requirePayloadAdminApi()
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Admin login required.' } }, { status: 401 })
  }

  try {
    const body = parseAdminAiChatRequest(await request.json())
    const profile = await resolveAdminAiProfile(payload, body.profileId)
    const model = selectProfileModel(profile, body.model)
    const lastUserIndex = getLastUserMessageIndex(body.messages)
    const lastUserMessage = lastUserIndex >= 0 ? body.messages[lastUserIndex] : undefined
    const attachmentContext = lastUserMessage?.attachmentIds?.length
      ? await loadAdminAiAttachmentContext({
        payload,
        adminUser: user,
        attachmentIds: lastUserMessage.attachmentIds,
        sessionId: body.sessionId,
      })
      : { attachments: [], contextMessage: '' }
    const providerMessages = body.messages.map((message, index) => ({
      role: message.role,
      content: index === lastUserIndex && attachmentContext.contextMessage
        ? `${attachmentContext.contextMessage}\n\nUser prompt:\n${message.content}`
        : message.content,
    }))
    const providerResult = await callOpenAiCompatibleChat({
      baseUrl: profile.baseUrl,
      apiKey: profile.apiKey,
      model,
      messages: providerMessages,
      systemPrompt: buildAdminAiSystemPrompt(profile),
      tools: getAdminAiToolDefinitions(),
    })
    const toolState = await handleAdminAiToolCalls(payload, user, providerResult.toolCalls)
    const assistantContent = providerResult.content ||
      (toolState.toolResults.length ? 'Tôi đã chạy tool đọc và trả kết quả bên dưới.' : '') ||
      (toolState.pendingActions.length ? 'Tôi đã tạo hành động chờ xác nhận.' : '')
    if (!assistantContent) {
      throw new AdminAiError('PROVIDER_ERROR', 'AI provider returned an empty response.', 502)
    }
    const now = new Date().toISOString()
    const session = lastUserMessage
      ? await appendAdminAiSessionTurn(payload, user, {
        sessionId: body.sessionId,
        profileId: profile.id,
        model,
        userMessage: {
          id: `user-${Date.now()}`,
          role: 'user',
          body: lastUserMessage.content,
          createdAt: now,
          attachments: attachmentContext.attachments,
        },
        assistantMessage: {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          body: assistantContent,
          createdAt: now,
          pendingActions: toolState.pendingActions,
          toolResults: toolState.toolResults,
          status: toolState.toolResults.length ? 'read' : undefined,
        },
      })
      : undefined
    const response: AdminAiChatResponse = {
      message: {
        role: 'assistant',
        content: assistantContent,
      },
      model,
      sessionId: session?.id,
      session,
      usage: providerResult.usage,
      ...toolState,
    }
    return NextResponse.json(response)
  } catch (error) {
    return errorResponse(error)
  }
}
