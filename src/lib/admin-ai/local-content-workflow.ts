import { createAdminAiActionConfirmation } from './admin-ai-confirmation-service'
import {
  buildAssistantContent,
  buildDraftPlan,
  extractResearchQuery,
  inferCategorySlug,
  inferTags,
  isLocalContentPrompt,
  pickTopic,
  readBlogCategories,
  resolveUniquePostSlug,
  type PayloadWorkflowReadClient,
} from './local-content-editorial-policy'
import { researchWebSources } from './tools/content-research-tools'
import { slugify } from './tools/post-tool-content-utils'

type PayloadWorkflowClient = PayloadWorkflowReadClient & {
  create: (args: { collection: string; data: Record<string, unknown>; [key: string]: unknown }) => Promise<unknown>
}

type WorkflowResult = {
  handled: boolean
  assistantContent: string
  pendingActions: Array<{ id: string; toolName: string; summary: string; expiresAt: string }>
  toolResults: Array<{ toolName: string; output: unknown }>
}

async function buildWorkflowDraft(payload: PayloadWorkflowClient, adminUser: unknown, prompt: string) {
  const categories = await readBlogCategories(payload)
  const researchSources = await researchWebSources({ query: extractResearchQuery(prompt) }, adminUser).catch(() => [])
  const topic = pickTopic(prompt, researchSources)
  const categorySlug = inferCategorySlug(prompt, topic, researchSources, categories)
  const tags = inferTags(topic, categorySlug, researchSources)
  const draftPlan = buildDraftPlan(topic, prompt, researchSources, categorySlug)
  const slug = await resolveUniquePostSlug(payload, topic, prompt)

  return {
    categorySlug,
    draftPlan,
    researchSources,
    slug,
    tags,
    topic,
  }
}

export async function runLocalContentWorkflow(
  payload: PayloadWorkflowClient,
  adminUser: unknown,
  prompt: string,
) {
  if (!isLocalContentPrompt(prompt)) {
    return {
      handled: false,
      assistantContent: '',
      pendingActions: [],
      toolResults: [],
    } satisfies WorkflowResult
  }

  const pendingActions: WorkflowResult['pendingActions'] = []
  const toolResults: WorkflowResult['toolResults'] = []

  const draft = await buildWorkflowDraft(payload, adminUser, prompt)
  if (draft.researchSources.length > 0) {
    const createDraftInput = {
      slug: draft.slug,
      categorySlug: draft.categorySlug,
      tags: draft.tags,
      sourceLedger: draft.researchSources,
      vi: {
        title: draft.draftPlan.title,
        excerpt: draft.draftPlan.excerpt,
        contentParagraphs: draft.draftPlan.contentParagraphs,
        ...(draft.draftPlan.contentPack ? { contentPack: draft.draftPlan.contentPack } : {}),
      },
    }

    const pendingAction = await createAdminAiActionConfirmation(
      payload as Parameters<typeof createAdminAiActionConfirmation>[0],
      adminUser,
      'post_create_write',
      createDraftInput,
      `Tao draft bai viet "${draft.draftPlan.title}"`,
    )
    pendingActions.push(pendingAction)
  }

  return {
    handled: true,
    assistantContent: buildAssistantContent(
      draft.topic,
      draft.researchSources,
      draft.categorySlug,
      draft.tags,
      draft.draftPlan,
      draft.researchSources.length > 0 ? draft.slug : slugify(draft.topic) || 'bai-viet-moi',
      pendingActions[0]?.id,
    ),
    pendingActions,
    toolResults,
  } satisfies WorkflowResult
}
