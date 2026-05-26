import { describe, expect, it } from 'vitest'
import { buildAdminAiSystemPrompt } from '@/lib/admin-ai/admin-ai-system-prompt'
import { toSafeAdminAiProfile } from '@/lib/admin-ai/admin-ai-profile-service'

describe('admin AI system prompt', () => {
  it('includes profile-configured behavior without dropping safety rules', () => {
    const prompt = buildAdminAiSystemPrompt({
      agentRole: 'Bạn là trợ lý biên tập SEO.',
      communicationStyle: 'Trả lời rất ngắn, dùng bullet.',
      operationalContext: 'GTKBlog ưu tiên nội dung AI và kỹ thuật phần mềm.',
      toolUsageRules: 'Luôn đọc draft trước khi đề xuất SEO.',
      customInstructions: 'Không mở rộng phạm vi ngoài admin.',
    })

    expect(prompt).toContain('Never reveal API keys')
    expect(prompt).toContain('Bạn là trợ lý biên tập SEO.')
    expect(prompt).toContain('Trả lời rất ngắn')
    expect(prompt).toContain('Luôn đọc draft')
    expect(prompt).toContain('Không mở rộng phạm vi ngoài admin.')
  })

  it('exposes editable behavior fields in safe profiles', () => {
    const profile = toSafeAdminAiProfile({
      id: 1,
      name: 'Admin Agent',
      baseUrl: 'https://provider.test/v1',
      defaultModel: 'model-a',
      agentRole: 'Role A',
      communicationStyle: 'Style A',
      operationalContext: 'Context A',
      toolUsageRules: 'Rules A',
      customInstructions: 'Custom A',
    })

    expect(profile).toMatchObject({
      agentRole: 'Role A',
      communicationStyle: 'Style A',
      operationalContext: 'Context A',
      toolUsageRules: 'Rules A',
      customInstructions: 'Custom A',
    })
  })
})
