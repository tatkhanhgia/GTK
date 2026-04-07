'use client'

import { Lightbulb, Heart, Target, Rocket } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RichTextRenderer } from '@/components/blog/rich-text-renderer'

interface Principle {
  title: string
  description: string
  icon?: 'lightbulb' | 'heart' | 'target' | 'rocket'
}

interface PhilosophySectionProps {
  story?: { root: { children: unknown[] } } | null
  principles: Principle[]
  locale: 'vi' | 'en'
  className?: string
}

const iconMap = {
  lightbulb: Lightbulb,
  heart: Heart,
  target: Target,
  rocket: Rocket,
}

export function PhilosophySection({
  story,
  principles,
  locale,
  className,
}: PhilosophySectionProps) {
  return (
    <div className={cn('space-y-10', className)}>
      {story && (
        <section className="rounded-2xl border border-border/60 bg-card p-6 md:p-8">
          <h3 className="mb-4 font-heading text-xl font-semibold">
            {locale === 'vi' ? 'Câu chuyện của tôi' : 'My Story'}
          </h3>
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <RichTextRenderer content={story} />
          </div>
        </section>
      )}

      {principles.length > 0 && (
        <section>
          <h3 className="mb-6 font-heading text-xl font-semibold">
            {locale === 'vi' ? 'Nguyên tắc làm việc' : 'Working Principles'}
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {principles.map((principle, index) => {
              const IconComponent = principle.icon ? iconMap[principle.icon] : null
              return (
                <article
                  key={index}
                  className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    {IconComponent && (
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <IconComponent className="h-5 w-5" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-heading text-base font-semibold">
                        {principle.title}
                      </h4>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {principle.description}
                      </p>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
