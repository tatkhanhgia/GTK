'use client'

import { motion, useReducedMotion, type Variants } from 'motion/react'
import type { ReactNode } from 'react'

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
  /** Extra className applied to the wrapper element. */
  className?: string
  /** Render as a section instead of a div. */
  as?: 'div' | 'section'
}

/**
 * ScrollReveal — lightweight wrapper that fades + slides its children
 * into view the first time they intersect the viewport. Honors the user's
 * prefers-reduced-motion setting by rendering a plain wrapper with no motion.
 */
export function ScrollReveal({
  children,
  y = 28,
  delay = 0,
  duration = 0.7,
  amount = 0.15,
  className,
  as = 'div',
}: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    const Tag = as
    return <Tag className={className}>{children}</Tag>
  }

  const variants: Variants = {
    hidden: { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        delay,
        // Subtle ease-out curve (close to Apple's easeOutExpo).
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  const MotionTag = as === 'section' ? motion.section : motion.div

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount, margin: '0px 0px -80px 0px' }}
      variants={variants}
    >
      {children}
    </MotionTag>
  )
}
