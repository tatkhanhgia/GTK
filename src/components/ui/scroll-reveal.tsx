'use client'

import { motion, useReducedMotion, type Variants } from 'motion/react'
import type { ReactNode } from 'react'
import {
  createRevealVariants,
  motionDurations,
  revealViewport,
} from '@/lib/motion/motion-presets'

interface ScrollRevealProps {
  children: ReactNode
  /** Vertical offset (px) from which the element animates in. */
  y?: number
  /** Animation delay in seconds. */
  delay?: number
  /** Animation duration in seconds. */
  duration?: number
  /** Viewport threshold: 0 = first pixel, 1 = fully visible. */
  amount?: number
  /** Re-run when scrolling away and back. Defaults to one reveal per mount. */
  replayOnScroll?: boolean
  /** Intersection margin for early/late reveal. */
  viewportMargin?: string
  /** Extra className applied to the wrapper element. */
  className?: string
  /** Render as a section instead of a div. */
  as?: 'div' | 'section'
}

/**
 * ScrollReveal — lightweight wrapper that fades + slides its children
 * into view once per mount by default. It replays on route remounts without
 * looping during normal scroll, and honors prefers-reduced-motion.
 */
export function ScrollReveal({
  children,
  y = 12,
  delay = 0,
  duration = motionDurations.section,
  amount = revealViewport.amount,
  replayOnScroll = false,
  viewportMargin = revealViewport.margin,
  className,
  as = 'div',
}: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    const Tag = as
    return <Tag className={className}>{children}</Tag>
  }

  const variants: Variants = createRevealVariants({ y, delay, duration })

  const MotionTag = as === 'section' ? motion.section : motion.div

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: !replayOnScroll, amount, margin: viewportMargin }}
      variants={variants}
    >
      {children}
    </MotionTag>
  )
}
