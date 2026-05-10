import type { Transition, Variants } from 'motion/react'

export const motionDurations = {
  fast: 0.15,
  micro: 0.2,
  normal: 0.25,
  page: 0.32,
  section: 0.4,
  slow: 0.48,
  counter: 0.9,
} as const

export const motionEasings = {
  enter: [0.22, 1, 0.36, 1],
  counter: [0.16, 1, 0.3, 1],
} as const

export const motionStagger = {
  child: 0.048,
  delay: 0.08,
  maxVisibleItems: 6,
} as const

// Default reveals run once while mounted, but replay naturally on route remount.
export const revealViewport = {
  once: true,
  amount: 0.15,
  margin: '0px 0px -80px 0px',
} as const

interface RevealVariantOptions {
  y?: number
  delay?: number
  duration?: number
  reducedMotion?: boolean
}

export function createRevealVariants({
  y = 12,
  delay = 0,
  duration = motionDurations.section,
  reducedMotion = false,
}: RevealVariantOptions = {}): Variants {
  if (reducedMotion) {
    return {
      hidden: { opacity: 1 },
      visible: { opacity: 1 },
    }
  }

  return {
    hidden: { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        delay,
        ease: motionEasings.enter,
      },
    },
  }
}

interface StaggerVariantOptions {
  delayChildren?: number
  staggerChildren?: number
  reducedMotion?: boolean
}

export function createStaggerContainerVariants({
  delayChildren = motionStagger.delay,
  staggerChildren = motionStagger.child,
  reducedMotion = false,
}: StaggerVariantOptions = {}): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        delayChildren: reducedMotion ? 0 : delayChildren,
        staggerChildren: reducedMotion ? 0 : staggerChildren,
      },
    },
  }
}

export function createCounterTransition(duration: number, delay = 0.12): Transition {
  return {
    duration,
    delay,
    ease: motionEasings.counter,
  }
}
