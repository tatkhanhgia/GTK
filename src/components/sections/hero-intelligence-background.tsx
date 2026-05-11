'use client'

import type { CSSProperties, PointerEvent } from 'react'
import type { ReactNode } from 'react'

const signalLines = [
  { className: 'left-[12%] top-[24%] w-36 rotate-[18deg]', delay: '0s' },
  { className: 'right-[16%] top-[32%] w-44 -rotate-[22deg]', delay: '1.8s' },
  { className: 'bottom-[28%] left-[22%] w-52 -rotate-[10deg]', delay: '3.2s' },
  { className: 'bottom-[22%] right-[20%] w-40 rotate-[14deg]', delay: '4.6s' },
]

const nodes = [
  'left-[18%] top-[30%]',
  'left-[34%] top-[18%]',
  'right-[30%] top-[24%]',
  'right-[18%] bottom-[34%]',
  'left-[27%] bottom-[26%]',
]

interface HeroInteractionFrameProps {
  children: ReactNode
}

export function HeroInteractionFrame({ children }: HeroInteractionFrameProps) {
  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const target = event.currentTarget
    const rect = target.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    target.style.setProperty('--hero-pointer-x', `${x.toFixed(2)}%`)
    target.style.setProperty('--hero-pointer-y', `${y.toFixed(2)}%`)
    target.style.setProperty('--hero-pointer-opacity', '1')
    target.dataset.heroActive = 'true'
  }

  function handlePointerLeave(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.style.setProperty('--hero-pointer-opacity', '0')
    event.currentTarget.dataset.heroActive = 'false'
  }

  return (
    <div
      className="hero-interaction-frame relative isolate flex min-h-[60vh] flex-col items-center justify-center px-6 py-20"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        '--hero-pointer-x': '50%',
        '--hero-pointer-y': '44%',
        '--hero-pointer-opacity': '0',
      } as CSSProperties}
    >
      {children}
    </div>
  )
}

export function HeroIntelligenceBackground() {
  return (
    <div
      aria-hidden="true"
      className="hero-intelligence-background pointer-events-none absolute inset-0 isolate overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_42%),radial-gradient(circle_at_20%_70%,color-mix(in_oklab,var(--success)_10%,transparent),transparent_34%),linear-gradient(180deg,transparent_0%,var(--background)_92%)]" />
      <div className="hero-pointer-spotlight pointer-events-none absolute inset-0" />
      <div className="hero-intelligence-grid pointer-events-none absolute inset-x-0 top-0 h-full opacity-[0.32] dark:opacity-[0.2]" />
      <div className="hero-intelligence-glass pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[min(78vw,760px)] -translate-x-1/2 -translate-y-1/2 rounded-[48%] border border-primary/10 bg-card/20 blur-[0.2px]" />

      {signalLines.map((line) => (
        <span
          key={`${line.className}-${line.delay}`}
          className={`hero-signal-line pointer-events-none absolute h-px ${line.className}`}
          style={{ animationDelay: line.delay }}
        />
      ))}

      {nodes.map((className, index) => (
        <span
          key={className}
          className={`hero-signal-node pointer-events-none absolute h-2 w-2 rounded-full ${className}`}
          style={{ animationDelay: `${index * 0.85}s` }}
        />
      ))}
    </div>
  )
}
