import type { CollectionConfig } from 'payload'
import { isPayloadAdminUser } from '../lib/admin/payload-admin-access'
import {
  encryptAdminAiSecret,
  isEncryptedAdminAiSecret,
  isMaskedAdminAiSecret,
  maskAdminAiSecret,
} from '../lib/admin-ai/admin-ai-secret-crypto'
import { getAdminAiBaseUrlPolicyMessage, isAllowedAdminAiBaseUrl } from '../lib/admin-ai/admin-ai-url-policy'

type AdminAiProfileDoc = {
  apiKeyEncrypted?: string | null
}

const defaultAgentRole = 'Bạn là trợ lý quản trị GTKBlog, hỗ trợ admin vận hành nội dung, SEO, health check và các tác vụ an toàn trong CMS.'
const defaultCommunicationStyle = 'Trả lời bằng tiếng Việt, ngắn gọn, trực tiếp, có cấu trúc Markdown dễ đọc. Ưu tiên đề xuất bước tiếp theo cụ thể.'
const defaultOperationalContext = 'GTKBlog là blog công nghệ và cửa hàng sản phẩm số dùng Next.js, Payload CMS, Better Auth, PostgreSQL, Stripe, SePay và Resend.'
const defaultToolUsageRules = 'Dùng read tools khi cần dữ liệu hệ thống. Với write tools, chỉ chuẩn bị hành động chờ admin xác nhận. Không tự nhận đã ghi dữ liệu nếu chưa có confirmation.'

function validateUrl(value?: string | null) {
  if (!value) return 'Base URL is required.'
  try {
    const url = new URL(value)
    return isAllowedAdminAiBaseUrl(url) ? true : getAdminAiBaseUrlPolicyMessage()
  } catch {
    return 'Base URL must be a valid URL.'
  }
}

function preserveOrEncryptSecret(value: unknown, originalDoc?: AdminAiProfileDoc) {
  if (!value || isMaskedAdminAiSecret(value)) {
    return originalDoc?.apiKeyEncrypted ?? null
  }

  const text = String(value)
  return isEncryptedAdminAiSecret(text) ? text : encryptAdminAiSecret(text)
}

export const AdminAiProfiles: CollectionConfig = {
  slug: 'admin-ai-profiles',
  labels: {
    singular: { vi: 'AI profile', en: 'AI profile' },
    plural: { vi: 'AI profiles', en: 'AI profiles' },
  },
  admin: {
    useAsTitle: 'name',
    group: { vi: 'He thong', en: 'System' },
    defaultColumns: ['name', 'providerType', 'defaultModel', 'enabled'],
    description: {
      vi: 'Luu provider OpenAI-compatible cho AI Ops Console.',
      en: 'Store OpenAI-compatible providers for the AI Ops Console.',
    },
  },
  access: {
    create: ({ req }) => isPayloadAdminUser(req.user),
    read: ({ req }) => isPayloadAdminUser(req.user),
    update: ({ req }) => isPayloadAdminUser(req.user),
    delete: ({ req }) => isPayloadAdminUser(req.user),
  },
  hooks: {
    afterRead: [
      ({ doc, context }) => {
        if (!context?.includeAdminAiSecret) {
          doc.apiKeyEncrypted = maskAdminAiSecret(doc.apiKeyEncrypted)
        }
        return doc
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: { vi: 'Ten profile', en: 'Profile name' } },
    {
      name: 'providerType',
      type: 'select',
      required: true,
      defaultValue: 'openai-compatible',
      label: { vi: 'Loai provider', en: 'Provider type' },
      options: [{ label: 'OpenAI compatible', value: 'openai-compatible' }],
    },
    { name: 'baseUrl', type: 'text', required: true, validate: validateUrl, label: 'Base URL' },
    {
      name: 'apiKeyEncrypted',
      type: 'text',
      required: true,
      label: 'API key',
      admin: {
        description: 'Enter a new key to rotate it. Stored encrypted and masked after save.',
      },
      hooks: {
        beforeChange: [
          ({ value, originalDoc }) => preserveOrEncryptSecret(value, originalDoc as AdminAiProfileDoc),
        ],
      },
    },
    { name: 'defaultModel', type: 'text', required: true, label: 'Default model' },
    {
      name: 'modelOptions',
      type: 'array',
      label: 'Model options',
      fields: [{ name: 'model', type: 'text', required: true }],
    },
    {
      name: 'agentRole',
      type: 'textarea',
      defaultValue: defaultAgentRole,
      label: { vi: 'Vai tro AI Agent', en: 'AI agent role' },
      admin: {
        description: 'Mô tả vai trò, phạm vi hỗ trợ, và cách agent tự giới thiệu.',
      },
    },
    {
      name: 'communicationStyle',
      type: 'textarea',
      defaultValue: defaultCommunicationStyle,
      label: { vi: 'Cach giao tiep', en: 'Communication style' },
      admin: {
        description: 'Tone, ngôn ngữ, độ dài, định dạng Markdown, cách đặt câu hỏi lại.',
      },
    },
    {
      name: 'operationalContext',
      type: 'textarea',
      defaultValue: defaultOperationalContext,
      label: { vi: 'Context van hanh', en: 'Operational context' },
      admin: {
        description: 'Thông tin nền về GTKBlog, domain, stack, quy trình, hoặc giới hạn cần nhớ.',
      },
    },
    {
      name: 'toolUsageRules',
      type: 'textarea',
      defaultValue: defaultToolUsageRules,
      label: { vi: 'Quy tac dung tool', en: 'Tool usage rules' },
      admin: {
        description: 'Cách quyết định dùng read/write tool, khi nào cần xác nhận, và cách báo kết quả.',
      },
    },
    {
      name: 'customInstructions',
      type: 'textarea',
      label: { vi: 'Huong dan tuy bien', en: 'Custom instructions' },
      admin: {
        description: 'Instruction bổ sung theo từng profile. Không nhập secret, token, cookie, hoặc private key.',
      },
    },
    { name: 'enabled', type: 'checkbox', defaultValue: true, label: { vi: 'Bat', en: 'Enabled' } },
    { name: 'notes', type: 'textarea', label: { vi: 'Ghi chu', en: 'Notes' } },
  ],
}
