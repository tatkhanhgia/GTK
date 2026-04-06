import { Calendar, FolderGit2, FileText } from 'lucide-react'

interface QuickStatsProps {
  yearsOfExperience?: number
  projectsCompleted?: number
  postsPublished?: number
  locale: string
}

export function QuickStats({
  yearsOfExperience = 0,
  projectsCompleted = 0,
  postsPublished = 0,
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
      value: yearsOfExperience || '+',
      label: labels.years,
      icon: Calendar,
    },
    {
      value: projectsCompleted || '+',
      label: labels.projects,
      icon: FolderGit2,
    },
    {
      value: postsPublished || '+',
      label: labels.posts,
      icon: FileText,
    },
  ]

  return (
    <section className="rounded-2xl border border-border/60 bg-card/50 p-6 md:p-8">
      <div className="grid grid-cols-3 gap-4 md:gap-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 md:h-14 md:w-14">
                <Icon className="h-5 w-5 text-primary md:h-6 md:w-6" />
              </div>
              <div className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {typeof stat.value === 'number' ? stat.value : stat.value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground md:text-sm">
                {stat.label}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
