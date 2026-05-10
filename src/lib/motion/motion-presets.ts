import type { Variants } from 'motion/react'

export const motionEasings = {
  standard: [0.4, 0, 0.2, 1],
  premiumEnter: [0.16, 1, 0.3, 1],
  exit: [0.4, 0, 1, 1],
} as const

export const motionDurations = {
  quick: 0.15,
  micro: 0.2,
  normal: 0.25,
  surface: 0.28,
  route: 0.32,
  reveal: 0.4,
} as const

export const motionTransitions = {
  quick: { duration: motionDurations.quick, ease: motionEasings.standard },
  hover: { duration: motionDurations.micro, ease: motionEasings.premiumEnter },
  surface: { duration: motionDurations.surface, ease: motionEasings.premiumEnter },
  route: { duration: motionDurations.route, ease: motionEasings.standard },
  reveal: { duration: motionDurations.reveal, ease: motionEasings.premiumEnter },
} as const

export const motionViewport = {
  once: true,
  amount: 0.18,
  margin: '0px 0px -72px 0px',
} as const

export function createRevealVariants(y = 18, delay = 0): Variants {
  return {
    hidden: { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        ...motionTransitions.reveal,
        delay,
      },
    },
  }
}

export function createStaggerContainer(staggerChildren = 0.08, delayChildren = 0.04): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren,
        delayChildren,
      },
    },
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
