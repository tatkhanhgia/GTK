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
      {context && <p className="mb-8 text-sm leading-relaxed text-muted-foreground md:text-base">{context}</p>}
      <div className="relative border-l-2 border-primary/30 pl-8 space-y-10">
        {timeline.map((entry, i) => {
          const type = entry.type && entry.type in typeBadgeStyles ? entry.type : 'work'
          return (
            <div key={`${entry.year}-${i}`} className="relative group">
              {/* Dot on the timeline line */}
              <div className="absolute -left-[43px] top-0.5 h-4 w-4 rounded-full bg-primary ring-4 ring-primary/20 border-2 border-background transition-all group-hover:ring-primary/40 group-hover:scale-110" />
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
