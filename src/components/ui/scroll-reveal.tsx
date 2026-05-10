'use client'

import { motion, useReducedMotion, type Variants } from 'motion/react'
import type { ReactNode } from 'react'
import { createRevealVariants, motionViewport } from '@/lib/motion/motion-presets'

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
  /** Stagger child motion elements when variants are provided downstream. */
  stagger?: number
}

/**
 * ScrollReveal — lightweight wrapper that fades + slides its children
 * into view the first time they intersect the viewport. Honors the user's
 * prefers-reduced-motion setting by rendering a plain wrapper with no motion.
 */
export function ScrollReveal({
  children,
  y = 18,
  delay = 0,
  duration,
  amount = motionViewport.amount,
  className,
  as = 'div',
  stagger = 0,
}: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    const Tag = as
    return <Tag className={className}>{children}</Tag>
  }

  const variants: Variants = createRevealVariants(y, delay)
  const visible = variants.visible
  if (visible && typeof visible === 'object' && 'transition' in visible) {
    visible.transition = {
      ...(visible.transition as object),
      ...(duration ? { duration } : {}),
      ...(stagger ? { staggerChildren: stagger } : {}),
    }
  }

  const MotionTag = as === 'section' ? motion.section : motion.div

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ ...motionViewport, amount }}
      variants={variants}
    >
      {children}
    </MotionTag>
  )
}
