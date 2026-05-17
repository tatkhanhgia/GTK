'use client'

import type { CSSProperties, PointerEvent } from 'react'
import type { ReactNode } from 'react'

const notebookSheets = [
  'left-[8%] top-[18%] h-44 w-32 rotate-[-7deg]',
  'right-[10%] top-[24%] h-56 w-40 rotate-[8deg]',
  'bottom-[14%] left-[18%] h-36 w-52 rotate-[3deg]',
]

const annotationRules = [
  { className: 'left-[13%] top-[31%] w-40 rotate-[-7deg]', delay: '0s' },
  { className: 'right-[15%] top-[44%] w-52 rotate-[5deg]', delay: '1.6s' },
  { className: 'bottom-[30%] left-[25%] w-48 rotate-[2deg]', delay: '3.1s' },
  { className: 'bottom-[24%] right-[22%] w-36 rotate-[-9deg]', delay: '4.4s' },
]

const annotationPins = [
  'left-[21%] top-[29%]',
  'right-[27%] top-[38%]',
  'left-[34%] bottom-[28%]',
  'right-[19%] bottom-[31%]',
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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_32%,color-mix(in_oklab,var(--primary)_10%,transparent),transparent_46%),radial-gradient(ellipse_at_14%_72%,color-mix(in_oklab,var(--accent)_8%,transparent),transparent_36%),linear-gradient(180deg,transparent_0%,var(--background)_92%)]" />
      <div className="hero-pointer-spotlight pointer-events-none absolute inset-0" />
      <div className="hero-notebook-ruled-paper pointer-events-none absolute inset-x-0 top-0 h-full opacity-[0.38] dark:opacity-[0.24]" />
      <div className="hero-notebook-spread pointer-events-none absolute left-1/2 top-1/2 h-[430px] w-[min(82vw,780px)] -translate-x-1/2 -translate-y-1/2 rotate-[-2deg] rounded-[28px] border border-border/70 bg-card/18" />

      {notebookSheets.map((className) => (
        <span key={className} className={`hero-notebook-sheet pointer-events-none absolute ${className}`} />
      ))}

      {annotationRules.map((line) => (
        <span
          key={`${line.className}-${line.delay}`}
          className={`hero-annotation-rule pointer-events-none absolute h-px ${line.className}`}
          style={{ animationDelay: line.delay }}
        />
      ))}

      {annotationPins.map((className, index) => (
        <span
          key={className}
          className={`hero-annotation-pin pointer-events-none absolute h-2 w-2 rounded-full ${className}`}
          style={{ animationDelay: `${index * 0.85}s` }}
        />
      ))}
    </div>
  )
}
