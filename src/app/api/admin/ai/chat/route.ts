import { NextResponse } from 'next/server'
import { requirePayloadAdminApi } from '@/lib/admin/payload-admin-api-auth'
import { AdminAiError, parseAdminAiChatRequest, type AdminAiChatResponse } from '@/lib/admin-ai/admin-ai-chat-contract'
import { resolveAdminAiProfile } from '@/lib/admin-ai/admin-ai-profile-service'
import { callOpenAiCompatibleChat } from '@/lib/admin-ai/openai-compatible-client'
import { getAdminAiToolDefinitions, handleAdminAiToolCalls } from '@/lib/admin-ai/admin-ai-tool-registry'
import { appendAdminAiSessionTurn } from '@/lib/admin-ai/admin-ai-session-service'
import { buildAdminAiSystemPrompt } from '@/lib/admin-ai/admin-ai-system-prompt'
import { loadAdminAiAttachmentContext } from '@/lib/admin-ai/files/admin-ai-file-context-service'
import { runLocalContentWorkflow } from '@/lib/admin-ai/local-content-workflow'
import { researchWebSources } from '@/lib/admin-ai/tools/content-research-tools'

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

function isLocalAdminAiProvider(baseUrl: string) {
  try {
    return new URL(baseUrl).protocol === 'http:'
  } catch {
    return false
  }
}

function getAllowedToolNamesForPrompt(prompt: string) {
  const normalized = prompt.toLowerCase()
  const wantsContent = /blog|post|article|bÃ i|bai|draft|write/.test(normalized)
  const wantsResearch = /research|nghiÃªn cá»©u|nghien cuu|tÃ¬m hiá»ƒu|tim hieu|sources|nguá»“n|nguon/.test(normalized)
  const wantsPage = /page|trang/.test(normalized)
  const wantsPublish = /publish|Ä‘Äƒng|dang|schedule|lá»‹ch|xáº¿p lá»‹ch|xep lich/.test(normalized)

  const names = new Set<string>()
  if (wantsResearch) {
    names.add('web_sources_research_read')
    names.add('existing_posts_sources_read')
  }
  if (wantsContent) {
    names.add('blog_categories_read')
    names.add('post_create_write')
    names.add('post_seo_update_write')
  }
  if (wantsPage) {
    names.add('page_create_write')
  }
  if (wantsPublish) {
    names.add('post_publish_write')
    names.add('post_schedule_write')
    names.add('page_publish_write')
    names.add('page_schedule_write')
  }
  return Array.from(names)
}

function extractResearchQuery(prompt: string) {
  const normalized = prompt.trim()
  const match = normalized.match(/(?:research|nghiÃªn cá»©u|nghien cuu|tÃ¬m hiá»ƒu|tim hieu)\s*(?:vá»?i|ve|về|about)?\s*(.+?)(?:\s+(?:sau Ä‘Ã³|sau do|rÃ²i|roi|Ä‘á»ƒ|de|vÃ |va|rồi|để)\b|$)/i)
  const raw = match?.[1]?.trim() ?? normalized
  return raw
    .replace(/^(model|chủ đề|chu de)\s+/i, '')
    .replace(/\b(bÃ i post\/blog|bai post\/blog|blog|post)\b.*$/i, '')
    .trim()
    .slice(0, 120)
}

function buildLocalDraftSystemPrompt(profile: { agentRole?: string; communicationStyle?: string; customInstructions?: string }) {
  return [
    'You are the GTKBlog admin assistant.',
    'Answer in Vietnamese.',
    'Keep responses concise and action-oriented.',
    'For research-and-blog requests, the system already attached verified source summaries. Use them first, then produce a short practical draft or outline.',
    'If the user asks to create or manage content, prepare the relevant content draft or pending action instead of guessing.',
    profile.agentRole?.trim() ? `Role: ${profile.agentRole.trim()}` : '',
    profile.communicationStyle?.trim() ? `Style: ${profile.communicationStyle.trim()}` : '',
    profile.customInstructions?.trim() ? `Custom instructions: ${profile.customInstructions.trim()}` : '',
  ].filter(Boolean).join('\n')
}

function buildResearchContextMessage(sources: { title: string; url?: string; summary: string }[]) {
  if (sources.length === 0) return ''
  return [
    'Verified research notes:',
    ...sources.map((source, index) => `${index + 1}. ${source.title}${source.url ? ` (${source.url})` : ''}: ${source.summary}`),
  ].join('\n')
}

function buildLocalDraftFallbackContent(userPrompt: string, researchContext = '') {
  const topicMatch = userPrompt.match(/gemma[\s-]*4/i)
  const topic = topicMatch ? 'Gemma 4' : 'chá»§ Ä‘á» báº¡n yÃªu cáº§u'
  return [
    `# ${topic}: báº£n nhÃ¡p blog nhanh`,
    '',
    '## TÃ³m táº¯t ngáº¯n',
    `- ${topic} lÃ  chá»§ Ä‘á» phÃ¹ há»£p Ä‘á»ƒ viáº¿t bÃ i theo hÆ°á»›ng Ä‘Ã¡nh giÃ¡ model, kháº£ nÄƒng dÃ¹ng local vÃ  ká»‹ch báº£n á»©ng dá»¥ng thá»±c táº¿.`,
    '- Náº¿u muá»‘n bÃ i viáº¿t há»¯u Ã­ch, nÃªn tÃ¡ch rÃµ: bá»‘i cáº£nh, Ä‘iá»ƒm máº¡nh, háº¡n cháº¿, vÃ  khi nÃ o nÃªn dÃ¹ng.',
    '',
    '## DÃ n Ã½ Ä‘á» xuáº¥t',
    '1. Gemma 4 lÃ  gÃ¬ vÃ  vÃ¬ sao Ä‘Ã¡ng chÃº Ã½',
    '2. Äiá»ƒm máº¡nh khi cháº¡y local hoáº·c trong workflow ná»™i bá»™',
    '3. Háº¡n cháº¿ cáº§n lÆ°u Ã½ trÆ°á»›c khi triá»ƒn khai tháº­t',
    '4. Khi nÃ o nÃªn chá»n Gemma 4 thay vÃ¬ model khÃ¡c',
    '5. Káº¿t luáº­n vÃ  khuyáººn nghá»‹ thá»±c táº¿',
    '',
    '## HÆ°á»›ng viáº¿t nhanh',
    '- Má»Ÿ bÃ i báº±ng bá»‘i cáº£nh sá»­ dá»¥ng.',
    '- ThÃªm 3-5 bullet vá» tráº£i nghiá»‡m thá»±c táº¿.',
    '- Káº¿t báº±ng khuyáººn nghá»‹ rÃµ rÃ ng cho ngÆ°á»i Ä‘á»c.',
  ].join('\n') + (researchContext ? `\n\n## Nguồn research\n${researchContext}` : '')
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
    const isLocalProvider = isLocalAdminAiProvider(profile.baseUrl)
    const attachmentContext = lastUserMessage?.attachmentIds?.length
      ? await loadAdminAiAttachmentContext({
        payload,
        adminUser: user,
        attachmentIds: lastUserMessage.attachmentIds,
        sessionId: body.sessionId,
      })
      : { attachments: [], contextMessage: '' }
    if (lastUserMessage?.attachmentIds?.length) {
      console.info('[admin-ai-chat] attachment context', {
        attachmentIds: lastUserMessage.attachmentIds,
        attachmentsLoaded: attachmentContext.attachments.length,
        contextChars: attachmentContext.contextMessage.length,
        sessionId: body.sessionId,
      })
    }
    const providerMessages = body.messages.map((message, index) => ({
      role: message.role,
      content: index === lastUserIndex && attachmentContext.contextMessage
        ? `${attachmentContext.contextMessage}\n\nUser prompt:\n${message.content}`
        : message.content,
    }))

    if (isLocalProvider && lastUserMessage) {
      const workflow = await runLocalContentWorkflow(payload, user, lastUserMessage.content)
      if (workflow.handled) {
        const now = new Date().toISOString()
        const session = await appendAdminAiSessionTurn(payload, user, {
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
            body: workflow.assistantContent,
            createdAt: now,
            pendingActions: workflow.pendingActions,
            toolResults: workflow.toolResults,
            status: workflow.toolResults.length ? 'read' : undefined,
          },
        })
        return NextResponse.json({
          message: { role: 'assistant', content: workflow.assistantContent },
          model,
          sessionId: session?.id,
          session,
          pendingActions: workflow.pendingActions,
          toolResults: workflow.toolResults,
        } satisfies AdminAiChatResponse)
      }
    }

    const allowedToolNames = isLocalProvider && lastUserMessage
      ? getAllowedToolNamesForPrompt(lastUserMessage.content)
      : undefined
    const isLocalContentDraftPrompt = Boolean(
      isLocalProvider &&
      lastUserMessage &&
      /blog|post|article|bÃƒÂ i|bai|draft|write|research|nghiÃƒÂªn cÃ¡Â»Â©u|nghien cuu|tÃƒÂ¬m hiá»Æ’u|tim hieu/.test(lastUserMessage.content.toLowerCase()),
    )
    const localResearchSources = isLocalContentDraftPrompt && lastUserMessage
      ? await researchWebSources({ query: extractResearchQuery(lastUserMessage.content) }, user).catch(() => [])
      : []
    const researchContextMessage = buildResearchContextMessage(localResearchSources)
    if (researchContextMessage && lastUserIndex >= 0) {
      providerMessages[lastUserIndex] = {
        ...providerMessages[lastUserIndex],
        content: `${providerMessages[lastUserIndex].content}\n\n${researchContextMessage}`,
      }
    }
    const providerTools = allowedToolNames?.length
      ? getAdminAiToolDefinitions(allowedToolNames)
      : getAdminAiToolDefinitions()
    const providerTimeoutMs = isLocalContentDraftPrompt ? 75000 : undefined
    let providerResult
    try {
      providerResult = await callOpenAiCompatibleChat({
        baseUrl: profile.baseUrl,
        apiKey: profile.apiKey,
        model,
        messages: providerMessages,
        systemPrompt: isLocalContentDraftPrompt
          ? buildLocalDraftSystemPrompt(profile)
          : buildAdminAiSystemPrompt(profile),
        tools: providerTools,
        timeoutMs: providerTimeoutMs,
      })
    } catch (error) {
      if (error instanceof AdminAiError && error.code === 'TIMEOUT' && isLocalContentDraftPrompt && lastUserMessage) {
        providerResult = {
          content: buildLocalDraftFallbackContent(lastUserMessage.content, researchContextMessage),
          toolCalls: [],
          usage: undefined,
        }
      } else {
        throw error
      }
    }
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
