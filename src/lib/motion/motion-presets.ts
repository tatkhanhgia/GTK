import type { Transition, Variants } from 'motion/react'

export const motionDurations = {
  fast: 0.15,
  quick: 0.15,
  micro: 0.2,
  normal: 0.25,
  surface: 0.28,
  page: 0.32,
  route: 0.32,
  section: 0.52,
  reveal: 0.46,
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

export const motionViewport = {
  section: revealViewport,
  card: { once: true, amount: 0.12, margin: '0px 0px -56px 0px' },
  editorialSection: { once: true, amount: 0.08, margin: '0px 0px -32px 0px' },
  editorialHeading: { once: true, amount: 0.12, margin: '0px 0px -40px 0px' },
  editorialCard: { once: true, amount: 0.08, margin: '0px 0px -24px 0px' },
} as const

export const revealPresets = {
  default: { y: 12, duration: motionDurations.section, scale: 1, viewport: 'section' },
  section: { y: 64, duration: motionDurations.section, scale: 1, viewport: 'editorialSection' },
  heading: { y: 40, duration: 0.44, scale: 1, viewport: 'editorialHeading' },
  card: { y: 52, duration: motionDurations.reveal, scale: 0.975, viewport: 'editorialCard' },
} as const

interface RevealVariantOptions {
  y?: number
  scale?: number
  delay?: number
  duration?: number
  reducedMotion?: boolean
}

export function createRevealVariants({
  y = 12,
  scale = 1,
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
    hidden: { opacity: 0, y, scale },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
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

export function getRevealVariants(
  y = 20,
  delay = 0,
  duration: number = motionDurations.section
): Variants {
  return createRevealVariants({ y, delay, duration })
}

export function getStaggerTransition(itemCount = 0): Transition {
  return {
    staggerChildren: itemCount > 0 ? Math.min(0.06, 0.24 / itemCount) : motionStagger.child,
    delayChildren: 0.04,
  }
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

export const cardHoverMotion = {
  y: -3,
  transition: { type: 'spring', stiffness: 320, damping: 28 },
} as const
