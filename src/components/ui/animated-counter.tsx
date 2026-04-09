'use client'

import { animate, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

interface AnimatedCounterProps {
  /** Target number to count up to. */
  value: number
  /** Duration of the count animation in seconds. */
  duration?: number
  /** Optional text prepended to the number (e.g. "$"). */
  prefix?: string
  /** Optional text appended to the number (e.g. "+", "%"). */
  suffix?: string
  /** Locale used for thousand separators; defaults to "en-US". */
  formatLocale?: string
  className?: string
}

/**
 * AnimatedCounter — counts from 0 up to `value` the first time it scrolls
 * into view. Uses motion's `animate()` for a framerate-smooth tween and
 * falls back to a static number when prefers-reduced-motion is enabled.
 */
export function AnimatedCounter({
  value,
  duration = 1.8,
  prefix,
  suffix,
  formatLocale = 'en-US',
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const prefersReducedMotion = useReducedMotion()
  const [display, setDisplay] = useState<number>(prefersReducedMotion ? value : 0)

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplay(value)
      return
    }
    if (!inView) return

    const controls = animate(0, value, {
      duration,
      // ease-out-expo — fast start, soft settle.
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(Math.floor(latest)),
    })

    return () => controls.stop()
  }, [inView, value, duration, prefersReducedMotion])

  const formatted = new Intl.NumberFormat(formatLocale).format(display)

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}
