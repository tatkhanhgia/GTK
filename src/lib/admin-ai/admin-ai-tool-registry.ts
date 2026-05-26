import type { OpenAiToolDefinition } from './openai-compatible-client'
import type { Where } from 'payload'
import { createAdminAiActionConfirmation } from './admin-ai-confirmation-service'
import { writeAdminAiAuditLog } from './admin-ai-audit-log-service'
import { AdminAiError, type AdminAiPendingAction, type AdminAiToolResult } from './admin-ai-chat-contract'
import { readRecentDraftPosts, updatePostSeoFields } from './tools/post-tools'
import { readSiteHealth } from './tools/site-health-tool'

type ToolCapability = 'read' | 'write' | 'ops'

type PayloadToolClient = {
  find: (args: { collection: string; [key: string]: unknown }) => Promise<{ docs?: unknown[] }>
  findByID: (args: { collection: string; id: string; [key: string]: unknown }) => Promise<unknown>
  update: {
    (args: { collection: string; id: string; data: Record<string, unknown>; [key: string]: unknown }): Promise<unknown>
    (args: { collection: string; where: Where; data: Record<string, unknown>; [key: string]: unknown }): Promise<{ docs?: unknown[] }>
  }
  create: (args: { collection: string; data: Record<string, unknown>; [key: string]: unknown }) => Promise<unknown>
}

type ToolDefinition = {
  name: string
  capability: ToolCapability
  description: string
  parameters: Record<string, unknown>
  summarize?: (input: unknown) => string
  execute: (payload: PayloadToolClient, input: unknown) => Promise<unknown>
}

const tools: ToolDefinition[] = [
  {
    name: 'site_health_read',
    capability: 'read',
    description: 'Read application health status.',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
    execute: () => readSiteHealth(),
  },
  {
    name: 'posts_recent_drafts_read',
    capability: 'read',
    description: 'List recent draft posts with safe SEO fields.',
    parameters: {
      type: 'object',
      properties: { limit: { type: 'number', minimum: 1, maximum: 10 } },
      additionalProperties: false,
    },
    execute: (payload, input) => readRecentDraftPosts(payload, input),
  },
  {
    name: 'post_seo_update_write',
    capability: 'write',
    description: 'Prepare an excerpt/tags SEO update for a post. Requires admin confirmation.',
    parameters: {
      type: 'object',
      required: ['postId'],
      properties: {
        postId: { type: 'string' },
        excerpt: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' }, maxItems: 12 },
      },
      additionalProperties: false,
    },
    summarize: (input) => `Update SEO fields for post ${(input as { postId?: unknown })?.postId ?? ''}`,
    execute: (payload, input) => updatePostSeoFields(payload, input),
  },
]

export function getAdminAiToolDefinitions(): OpenAiToolDefinition[] {
  return tools.map((tool) => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }))
}

function findTool(name: string) {
  const tool = tools.find((entry) => entry.name === name)
  if (!tool) throw new AdminAiError('TOOL_ERROR', `Unknown tool: ${name}`, 400)
  return tool
}

function parseToolInput(raw: string) {
  try {
    return raw ? JSON.parse(raw) : {}
  } catch {
    throw new AdminAiError('TOOL_ERROR', 'Tool arguments must be valid JSON.', 400)
  }
}

export async function handleAdminAiToolCalls(
  payload: PayloadToolClient,
  adminUser: unknown,
  calls: Array<{ function: { name: string; arguments: string } }>,
) {
  const toolResults: AdminAiToolResult[] = []
  const pendingActions: AdminAiPendingAction[] = []

  for (const call of calls) {
    const tool = findTool(call.function.name)
    const input = parseToolInput(call.function.arguments)

    if (tool.capability === 'read') {
      const output = await tool.execute(payload, input)
      await writeAdminAiAuditLog(payload, { event: 'tool_read', toolName: tool.name, adminUser, input, result: output })
      toolResults.push({ toolName: tool.name, output })
      continue
    }

    pendingActions.push(await createAdminAiActionConfirmation(
      payload,
      adminUser,
      tool.name,
      input,
      tool.summarize?.(input) ?? `Confirm ${tool.name}`,
    ))
  }

  return { toolResults, pendingActions }
}

export async function executeConfirmedAdminAiTool(payload: PayloadToolClient, toolName: string, input: unknown) {
  const tool = findTool(toolName)
  if (tool.capability !== 'write') {
    throw new AdminAiError('TOOL_ERROR', 'Only write tools can be confirmed.', 400)
  }
  return tool.execute(payload, input)
}
