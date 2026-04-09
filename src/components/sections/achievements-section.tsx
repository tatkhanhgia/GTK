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
import { AnimatedCounter } from '@/components/ui/animated-counter'

// Type definitions live next to the sole consumer component so data-fetching
// helpers can depend on them without pulling in extra modules.
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

/**
 * AchievementsSection — portfolio-style stats block with staggered scroll
 * reveal and per-item count-up animation. Designed to sit between hero and
 * content sections on the homepage + About page.
 */
export function AchievementsSection({
  achievements,
  title,
  subtitle,
  eyebrow,
  variant = 'plain',
}: AchievementsSectionProps) {
  const prefersReducedMotion = useReducedMotion()

  if (achievements.length === 0) return null

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1,
        delayChildren: prefersReducedMotion ? 0 : 0.08,
      },
    },
  }

  const itemVariants: Variants = prefersReducedMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
        },
      }

  const wrapperClass =
    variant === 'contained'
      ? 'relative overflow-hidden rounded-3xl border border-border/60 bg-card/40 px-6 py-14 md:px-10 md:py-16'
      : 'px-6 py-16 md:py-20'

  // Dynamic grid columns: 1 on mobile, 2 on small, N on medium where N = min(items, 4).
  const mdCols =
    achievements.length >= 4
      ? 'md:grid-cols-4'
      : achievements.length === 3
        ? 'md:grid-cols-3'
        : 'md:grid-cols-2'

  return (
    <section className={wrapperClass}>
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="mb-10 text-center md:mb-14"
        >
          {eyebrow ? (
            <motion.p
              variants={itemVariants}
              className="text-xs font-medium uppercase tracking-[0.22em] text-primary md:text-sm"
            >
              {eyebrow}
            </motion.p>
          ) : null}
          <motion.h2
            variants={itemVariants}
            className="mt-3 font-heading text-3xl font-bold tracking-tight md:text-4xl"
          >
            {title}
          </motion.h2>
          {subtitle ? (
            <motion.p
              variants={itemVariants}
              className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base"
            >
              {subtitle}
            </motion.p>
          ) : null}
        </motion.div>

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={containerVariants}
          className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${mdCols} md:gap-6`}
        >
          {achievements.map((item, index) => {
            const Icon = ICON_MAP[item.icon] ?? Award
            return (
              <motion.li
                key={`${item.label}-${index}`}
                variants={itemVariants}
                whileHover={prefersReducedMotion ? undefined : { y: -4 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-6 text-center backdrop-blur-sm md:p-8"
              >
                {/* Subtle gradient glow on hover */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/0 via-primary/0 to-accent/0 opacity-0 transition-opacity duration-500 group-hover:from-primary/10 group-hover:to-accent/10 group-hover:opacity-100"
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
              </motion.li>
            )
          })}
        </motion.ul>
      </div>
    </section>
  )
}
