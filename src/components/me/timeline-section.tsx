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

  return (
    <section>
      <h2 className="font-heading font-bold text-2xl mb-4">
        {locale === 'vi' ? 'Những cột mốc đáng nhớ' : 'Moments that shaped me'}
      </h2>
      {context && <p className="mb-6 text-sm leading-relaxed text-muted-foreground md:text-base">{context}</p>}
      <div className="relative border-l-2 border-border pl-8 space-y-8">
        {timeline.map((entry, i) => {
          const type = entry.type && entry.type in typeBadgeStyles ? entry.type : 'work'
          return (
            <div key={`${entry.year}-${i}`} className="relative">
              {/* Dot on the timeline line */}
              <div className="absolute -left-[41px] top-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
              <div className="flex items-center gap-3 mb-1">
                <span className="font-heading font-bold text-lg">{entry.year}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeBadgeStyles[type]}`}>
                  {labels[type]}
                </span>
              </div>
              <h3 className="font-medium">{entry.title}</h3>
              {entry.description && (
                <p className="text-muted-foreground text-sm mt-1">{entry.description}</p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
