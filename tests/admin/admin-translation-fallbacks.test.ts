import { describe, expect, it } from 'vitest'
import { generatedTranslations } from '@/admin/i18n/generated-translations'
import { customTranslations } from '@/admin/i18n/custom-translations'

describe('admin translation fallbacks', () => {
  it('bundles committed admin labels for builds without DB generation', () => {
    expect(generatedTranslations.vi.customSidebar.dashboard).toBe(
      customTranslations.vi.customSidebar.dashboard
    )
    expect(generatedTranslations.en.customHeader.searchPlaceholderDefault).toBe(
      customTranslations.en.customHeader.searchPlaceholderDefault
    )
    expect(generatedTranslations.en.customDashboard.quickPostTitle).toBe(
      customTranslations.en.customDashboard.quickPostTitle
    )
  })
})
