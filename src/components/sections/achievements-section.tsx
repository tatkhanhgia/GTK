'use client'

import {
  Award,
  Calendar,
  Code,
  FileText,
  FolderGit2,
  Rocket,
  Sparkles,
  Target,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { motion, useReducedMotion, type Variants } from 'motion/react'
import { useEffect, useState, type ElementType } from 'react'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import {
  createRevealVariants,
  createStaggerContainerVariants,
  motionViewport,
  revealPresets,
} from '@/lib/motion/motion-presets'

export type AchievementIcon =
  | 'award'
  | 'calendar'
  | 'code'
  | 'folder-git'
  | 'file-text'
  | 'rocket'
  | 'sparkles'
  | 'target'
  | 'users'
  | 'zap'

export interface AchievementItem {
  label: string
  value: number
  suffix?: string
  icon: AchievementIcon
}

interface AchievementsSectionProps {
  achievements: AchievementItem[]
  title: string
  subtitle?: string
  eyebrow?: string
  /** Visual variant. `plain` for in-page cards, `contained` for a bordered section. */
  variant?: 'plain' | 'contained'
}

const ICON_MAP: Record<AchievementIcon, LucideIcon> = {
  award: Award,
  calendar: Calendar,
  code: Code,
  'folder-git': FolderGit2,
  'file-text': FileText,
  rocket: Rocket,
  sparkles: Sparkles,
  target: Target,
  users: Users,
  zap: Zap,
}

export function AchievementsSection({
  achievements,
  title,
  subtitle,
  eyebrow,
  variant = 'plain',
}: AchievementsSectionProps) {
  const prefersReducedMotion = useReducedMotion()
  const [hasMounted, setHasMounted] = useState(false)
  const shouldAnimate = hasMounted && !prefersReducedMotion

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (achievements.length === 0) return null

  const containerVariants: Variants = createStaggerContainerVariants({
    reducedMotion: Boolean(prefersReducedMotion),
  })
  const itemVariants: Variants = createRevealVariants({
    y: revealPresets.card.y,
    scale: revealPresets.card.scale,
    duration: revealPresets.card.duration,
    reducedMotion: Boolean(prefersReducedMotion),
  })

  const wrapperClass =
    variant === 'contained'
      ? 'relative overflow-hidden rounded-3xl border border-border/60 bg-card/40 px-6 py-14 md:px-10 md:py-16'
      : 'px-6 py-16 md:py-20'

  const mdCols =
    achievements.length >= 4
      ? 'md:grid-cols-4'
      : achievements.length === 3
        ? 'md:grid-cols-3'
        : 'md:grid-cols-2'

  const HeadingGroup = (shouldAnimate ? motion.div : 'div') as ElementType
  const Eyebrow = (shouldAnimate ? motion.p : 'p') as ElementType
  const Title = (shouldAnimate ? motion.h2 : 'h2') as ElementType
  const Subtitle = (shouldAnimate ? motion.p : 'p') as ElementType
  const List = (shouldAnimate ? motion.ul : 'ul') as ElementType
  const ListItem = (shouldAnimate ? motion.li : 'li') as ElementType

  const headingGroupMotionProps = shouldAnimate
    ? {
        initial: 'hidden',
        whileInView: 'visible',
        viewport: motionViewport.editorialHeading,
        variants: containerVariants,
      }
    : {}
  const listMotionProps = shouldAnimate
    ? {
        initial: 'hidden',
        whileInView: 'visible',
        viewport: motionViewport.editorialCard,
        variants: containerVariants,
      }
    : {}
  const itemMotionProps = shouldAnimate ? { variants: itemVariants } : {}
  const listItemMotionProps = shouldAnimate
    ? {
        variants: itemVariants,
        whileHover: { y: -4 },
        transition: { type: 'spring', stiffness: 260, damping: 22 },
      }
    : {}

  return (
    <section className={wrapperClass}>
      <div className="mx-auto max-w-6xl">
        <HeadingGroup {...headingGroupMotionProps} className="mb-10 text-center md:mb-14">
          {eyebrow ? (
            <Eyebrow
              {...itemMotionProps}
              className="text-xs font-medium uppercase tracking-[0.22em] text-primary md:text-sm"
            >
              {eyebrow}
            </Eyebrow>
          ) : null}
          <Title
            {...itemMotionProps}
            className="mt-3 font-heading text-3xl font-bold tracking-tight md:text-4xl"
          >
            {title}
          </Title>
          {subtitle ? (
            <Subtitle
              {...itemMotionProps}
              className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base"
            >
              {subtitle}
            </Subtitle>
          ) : null}
        </HeadingGroup>

        <List
          {...listMotionProps}
          className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${mdCols} md:gap-6`}
        >
          {achievements.map((item, index) => {
            const Icon = ICON_MAP[item.icon] ?? Award
            return (
              <ListItem
                key={`${item.label}-${index}`}
                {...listItemMotionProps}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-6 text-center backdrop-blur-sm md:p-8"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/0 via-primary/0 to-accent/0 opacity-0 transition-opacity duration-300 ease-enter group-hover:from-primary/10 group-hover:to-accent/10 group-hover:opacity-100"
                />
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 md:h-14 md:w-14">
                  <Icon className="h-5 w-5 text-primary md:h-6 md:w-6" aria-hidden="true" />
                </div>
                <div className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                  <AnimatedCounter value={item.value} suffix={item.suffix} />
                </div>
                <div className="mt-2 text-sm text-muted-foreground md:text-base">
                  {item.label}
                </div>
              </ListItem>
            )
          })}
        </List>
      </div>
    </section>
  )
}
