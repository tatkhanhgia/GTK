import { AdminAiError, type AdminAiSafeProfile } from './admin-ai-chat-contract'
import { decryptAdminAiSecret } from './admin-ai-secret-crypto'

type PayloadListResult = {
  docs?: unknown[]
}

type PayloadProfileClient = {
  find: (args: { collection: string; [key: string]: unknown }) => Promise<PayloadListResult>
  findByID: (args: { collection: string; id: string; [key: string]: unknown }) => Promise<unknown>
}

type AdminAiProfileRecord = {
  id?: string | number
  name?: unknown
  providerType?: unknown
  baseUrl?: unknown
  apiKeyEncrypted?: unknown
  defaultModel?: unknown
  modelOptions?: unknown
  agentRole?: unknown
  communicationStyle?: unknown
  operationalContext?: unknown
  toolUsageRules?: unknown
  customInstructions?: unknown
  enabled?: unknown
}

export type ResolvedAdminAiProfile = AdminAiSafeProfile & {
  apiKey: string
}

function asProfileRecord(doc: unknown): AdminAiProfileRecord {
  return doc && typeof doc === 'object' ? (doc as AdminAiProfileRecord) : {}
}

function getModelOptions(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (typeof item === 'string') return item
      if (item && typeof item === 'object' && typeof (item as { model?: unknown }).model === 'string') {
        return (item as { model: string }).model
      }
      return ''
    })
    .map((model) => model.trim())
    .filter(Boolean)
}

function getOptionalText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

export function toSafeAdminAiProfile(doc: unknown): AdminAiSafeProfile {
  const profile = asProfileRecord(doc)
  return {
    id: String(profile.id ?? ''),
    name: String(profile.name ?? 'AI profile'),
    providerType: String(profile.providerType ?? 'openai-compatible'),
    baseUrl: String(profile.baseUrl ?? ''),
    defaultModel: String(profile.defaultModel ?? ''),
    modelOptions: getModelOptions(profile.modelOptions),
    agentRole: getOptionalText(profile.agentRole),
    communicationStyle: getOptionalText(profile.communicationStyle),
    operationalContext: getOptionalText(profile.operationalContext),
    toolUsageRules: getOptionalText(profile.toolUsageRules),
    customInstructions: getOptionalText(profile.customInstructions),
    enabled: profile.enabled !== false,
  }
}

function toResolvedProfile(doc: unknown): ResolvedAdminAiProfile {
  const safe = toSafeAdminAiProfile(doc)
  const encrypted = asProfileRecord(doc).apiKeyEncrypted
  const apiKey = decryptAdminAiSecret(typeof encrypted === 'string' ? encrypted : null)

  if (!safe.id || !safe.baseUrl || !safe.defaultModel || !apiKey) {
    throw new AdminAiError('NO_PROFILE', 'AI profile is incomplete.', 400)
  }
  if (!safe.enabled) {
    throw new AdminAiError('DISABLED_PROFILE', 'Selected AI profile is disabled.', 400)
  }

  return { ...safe, apiKey }
}

export async function listSafeAdminAiProfiles(payload: PayloadProfileClient) {
  const result = await payload.find({
    collection: 'admin-ai-profiles',
    limit: 100,
    sort: 'name',
    where: { enabled: { equals: true } },
  })
  return (result.docs ?? []).map(toSafeAdminAiProfile)
}

export async function resolveAdminAiProfile(payload: PayloadProfileClient, profileId?: string) {
  if (profileId) {
    return toResolvedProfile(await payload.findByID({
      collection: 'admin-ai-profiles',
      id: profileId,
      context: { includeAdminAiSecret: true },
    }))
  }

  const result = await payload.find({
    collection: 'admin-ai-profiles',
    limit: 1,
    where: { enabled: { equals: true } },
    context: { includeAdminAiSecret: true },
  })
  const doc = result.docs?.[0]
  if (!doc) {
    throw new AdminAiError('NO_PROFILE', 'Create an enabled AI profile before using chat.', 404)
  }
  return toResolvedProfile(doc)
}
