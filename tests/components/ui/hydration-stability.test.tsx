import { render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { AchievementsSection } from '@/components/sections/achievements-section'
import { NewsletterSection } from '@/components/ui/newsletter-section'
import { PageMotionShell } from '@/components/ui/page-motion-shell'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

vi.mock('next/navigation', () => ({
  usePathname: () => '/en',
}))

describe('homepage hydration stability', () => {
  it('server-renders PageMotionShell without Motion initial styles', () => {
    const html = renderToString(
      <PageMotionShell>
        <div>Hydration stable page</div>
      </PageMotionShell>
    )

    expect(html).not.toContain('opacity:0')
    expect(html).not.toContain('translateY')
  })

  it('server-renders ScrollReveal without Motion styles before hydration', () => {
    const html = renderToString(
      <ScrollReveal preset="section">
        <div>Hydration stable content</div>
      </ScrollReveal>
    )

    expect(html).not.toContain('opacity:0')
    expect(html).not.toContain('translateY')
  })

  it('server-renders achievements without Motion styles before hydration', () => {
    const html = renderToString(
      <AchievementsSection
        achievements={[{ label: 'Posts', value: 12, icon: 'file-text' }]}
        title="Blog qua nhung con so"
      />
    )

    expect(html).not.toContain('opacity:0')
    expect(html).not.toContain('translateY')
  })

  it('uses a deterministic newsletter input id', () => {
    render(<NewsletterSection locale="vi" />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('id', 'newsletter-email')
    expect(input).toHaveAttribute('name', 'email')
    expect(input).toHaveAttribute('autocomplete', 'email')
  })
})
