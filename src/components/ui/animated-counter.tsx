'use client'

import { animate, useInView, useReducedMotion } from 'motion/react'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import {
  createCounterTransition,
  motionDurations,
  revealViewport,
} from '@/lib/motion/motion-presets'

interface AnimatedCounterProps {
  /** Target number to count up to. */
  value: number
  /** Duration of the count animation in seconds. */
  duration?: number
  /** Delay before counting starts, useful when parent section is revealing. */
  startDelay?: number
  /** Optional text prepended to the number (e.g. "$"). */
  prefix?: string
  /** Optional text appended to the number (e.g. "+", "%"). */
  suffix?: string
  /** Locale used for thousand separators; defaults to "en-US". */
  formatLocale?: string
  className?: string
}

function getCounterDuration(value: number) {
  const magnitude = Math.abs(value)
  if (magnitude <= 10) return 0.75
  if (magnitude <= 100) return motionDurations.counter
  return 1.1
}

/**
 * AnimatedCounter — counts from 0 up to `value` the first time it scrolls
 * into view. Uses motion's `animate()` for a framerate-smooth tween and
 * falls back to a static number when prefers-reduced-motion is enabled.
 */
export function AnimatedCounter({
  value,
  duration,
  startDelay = 0.12,
  prefix,
  suffix,
  formatLocale = 'en-US',
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const lastRunKeyRef = useRef<string | null>(null)
  const pathname = usePathname()
  const inView = useInView(ref, {
    once: true,
    amount: 0.4,
    margin: revealViewport.margin,
  })
  const prefersReducedMotion = useReducedMotion()
  const replayKey = `${pathname}:${value}`
  const [display, setDisplay] = useState<number>(0)
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    setHasHydrated(true)
  }, [])

  useEffect(() => {
    if (!hasHydrated) return

    if (prefersReducedMotion) {
      setDisplay(value)
      lastRunKeyRef.current = replayKey
      return
    }
    if (!inView) {
      if (lastRunKeyRef.current !== replayKey) {
        setDisplay(0)
      }
      return
    }
    if (lastRunKeyRef.current === replayKey) return

    lastRunKeyRef.current = replayKey
    setDisplay(0)
    const counterDuration = duration ?? getCounterDuration(value)

    const controls = animate(0, value, {
      ...createCounterTransition(counterDuration, startDelay),
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    })

    return () => controls.stop()
  }, [hasHydrated, inView, value, duration, startDelay, prefersReducedMotion, replayKey])

  const formatted = new Intl.NumberFormat(formatLocale).format(display)

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}
