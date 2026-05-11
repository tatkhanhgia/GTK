'use client'

import { Calendar, FileText, FolderGit2 } from 'lucide-react'
import { motion, useReducedMotion, type Variants } from 'motion/react'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import {
  createRevealVariants,
  createStaggerContainerVariants,
  motionViewport,
  revealPresets,
} from '@/lib/motion/motion-presets'

interface QuickStatsProps {
  yearsOfExperience?: number
  projectsCompleted?: number
  postsPublished?: number
  locale: string
}

function toCounterValue(value?: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

export function QuickStats({
  yearsOfExperience,
  projectsCompleted,
  postsPublished,
  locale,
}: QuickStatsProps) {
  const t = {
    vi: {
      years: 'năm xây dựng',
      projects: 'thứ đã tạo ra',
      posts: 'bài viết',
    },
    en: {
      years: 'years building',
      projects: 'things shipped',
      posts: 'pieces written',
    },
  }

  const labels = locale === 'vi' ? t.vi : t.en

  const stats = [
    {
      value: toCounterValue(yearsOfExperience),
      label: labels.years,
      icon: Calendar,
    },
    {
      value: toCounterValue(projectsCompleted),
      label: labels.projects,
      icon: FolderGit2,
    },
    {
      value: toCounterValue(postsPublished),
      label: labels.posts,
      icon: FileText,
    },
  ]

  const prefersReducedMotion = useReducedMotion()
  const containerVariants: Variants = createStaggerContainerVariants({
    reducedMotion: Boolean(prefersReducedMotion),
  })
  const itemVariants: Variants = createRevealVariants({
    y: revealPresets.card.y,
    scale: revealPresets.card.scale,
    duration: revealPresets.card.duration,
    reducedMotion: Boolean(prefersReducedMotion),
  })

  return (
    <section className="rounded-2xl border border-border/60 bg-card/50 p-6 md:p-8">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={motionViewport.editorialCard}
        variants={containerVariants}
        className="grid grid-cols-3 gap-4 md:gap-8"
      >
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              whileHover={prefersReducedMotion ? undefined : { y: -4 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="text-center"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 md:h-14 md:w-14">
                <Icon className="h-5 w-5 text-primary md:h-6 md:w-6" aria-hidden="true" />
              </div>
              <div className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {stat.value !== null ? (
                  <AnimatedCounter value={stat.value} startDelay={0.12} />
                ) : (
                  '+'
                )}
              </div>
              <div className="mt-1 text-xs text-muted-foreground md:text-sm">
                {stat.label}
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </section>
  )
}
