import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

vi.mock('motion/react', () => {
  function MotionDiv({
    initial,
    whileInView,
    children,
  }: {
    initial?: string | false
    whileInView?: string
    children: React.ReactNode
  }) {
    return (
      <div
        data-initial={String(initial)}
        data-while-in-view={whileInView ?? ''}
      >
        {children}
      </div>
    )
  }

  return {
    motion: {
      div: MotionDiv,
      section: MotionDiv,
    },
    useReducedMotion: () => false,
  }
})

describe('ScrollReveal animation lifecycle', () => {
  it('keeps initial hidden state and enables reveal animation props after mount', async () => {
    render(
      <ScrollReveal>
        <span>Reveal me</span>
      </ScrollReveal>
    )

    const wrapper = screen.getByText('Reveal me').parentElement
    expect(wrapper).toHaveAttribute('data-initial', 'hidden')

    await waitFor(() => {
      expect(wrapper).toHaveAttribute('data-initial', 'hidden')
      expect(wrapper).toHaveAttribute('data-while-in-view', 'visible')
    })
  })
})
