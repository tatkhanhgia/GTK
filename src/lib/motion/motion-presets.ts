import type { Transition, Variants } from 'motion/react'

export const motionDurations = {
  fast: 0.15,
  quick: 0.15,
  micro: 0.2,
  normal: 0.25,
  surface: 0.28,
  page: 0.32,
  route: 0.32,
  section: 0.4,
  reveal: 0.4,
  slow: 0.48,
  counter: 0.9,
} as const

export const motionEasings = {
  standard: [0.4, 0, 0.2, 1],
  enter: [0.16, 1, 0.3, 1],
  premiumEnter: [0.16, 1, 0.3, 1],
  counter: [0.16, 1, 0.3, 1],
  exit: [0.4, 0, 1, 1],
} as const

export const motionTransitions = {
  quick: { duration: motionDurations.quick, ease: motionEasings.standard },
  hover: { duration: motionDurations.micro, ease: motionEasings.premiumEnter },
  surface: { duration: motionDurations.surface, ease: motionEasings.premiumEnter },
  route: { duration: motionDurations.route, ease: motionEasings.standard },
  reveal: { duration: motionDurations.reveal, ease: motionEasings.premiumEnter },
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

export const motionViewport = revealViewport

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

export function createStaggerContainer(
  staggerChildren = motionStagger.child,
  delayChildren = motionStagger.delay
): Variants {
  return createStaggerContainerVariants({ staggerChildren, delayChildren })
}

export function createCounterTransition(duration: number, delay = 0.12): Transition {
  return {
    duration,
    delay,
    ease: motionEasings.counter,
  }
}

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: motionTransitions.surface,
  },
}

export const surfaceVariants: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: motionTransitions.surface,
  },
  exit: {
    opacity: 0,
    y: 4,
    scale: 0.98,
    transition: { duration: motionDurations.quick, ease: motionEasings.exit },
  },
}
