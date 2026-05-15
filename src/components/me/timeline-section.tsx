'use client'

import { useIsMobile } from '@/hooks/use-media-query'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { cn } from '@/lib/utils'

interface TimelineEntry {
  year: string
  title: string
  description?: string
  type?: 'work' | 'education' | 'project' | 'milestone'
}

interface TimelineSectionProps {
  timeline: TimelineEntry[]
  locale: string
  context?: string
}

const typeBadgeStyles: Record<string, string> = {
  work: 'bg-primary/10 text-primary',
  education: 'bg-accent/10 text-accent',
  project: 'bg-success/10 text-success',
  milestone: 'bg-warning/10 text-warning',
}

const typeLabels: Record<string, Record<string, string>> = {
  vi: { work: 'Công việc', education: 'Học vấn', project: 'Dự án', milestone: 'Cột mốc' },
  en: { work: 'Work', education: 'Education', project: 'Project', milestone: 'Milestone' },
}

export function TimelineSection({ timeline, locale, context }: TimelineSectionProps) {
  const labels = typeLabels[locale] || typeLabels.en
  const isMobile = useIsMobile()
  const reducedMotion = useReducedMotion()
  const shouldAnimate = !isMobile && !reducedMotion

  return (
    <section>
      {context && <p className="mb-8 text-sm leading-relaxed text-muted-foreground md:text-base">{context}</p>}
      <div className="relative space-y-10 border-l-2 border-primary/30 pl-8 md:pl-10">
        {timeline.map((entry, i) => {
          const type = entry.type && entry.type in typeBadgeStyles ? entry.type : 'work'
          return (
            <div key={`${entry.year}-${i}`} className="relative group">
              {/* Dot on the timeline line */}
              <div
                className={cn(
                  'absolute top-0.5 h-4 w-4 rounded-full border-2 border-background bg-primary ring-4 ring-primary/20',
                  '-left-[43px] md:-left-[49px]',
                  shouldAnimate && 'transition-[box-shadow,transform] duration-200 ease-enter group-hover:scale-110 group-hover:ring-primary/40'
                )}
              />
              <div className="mb-1 flex flex-wrap items-center gap-2 md:gap-3">
                <span className="font-heading text-lg font-bold">{entry.year}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeBadgeStyles[type]}`}>
                  {labels[type]}
                </span>
              </div>
              <h3 className="font-medium">{entry.title}</h3>
              {entry.description && (
                <p className="mt-1 text-sm text-muted-foreground">{entry.description}</p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
