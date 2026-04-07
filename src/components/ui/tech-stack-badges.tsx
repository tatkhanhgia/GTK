import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Technology {
  name: string
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'ai' | 'other'
}

interface TechStackBadgesProps {
  technologies: Technology[]
  maxDisplay?: number
  className?: string
}

const categoryColors: Record<string, string> = {
  frontend: 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200',
  backend: 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200',
  database: 'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-200',
  devops: 'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200',
  ai: 'bg-pink-100 text-pink-800 hover:bg-pink-200 dark:bg-pink-900 dark:text-pink-200',
  other: 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200',
}

const categoryLabels: Record<string, { vi: string; en: string }> = {
  frontend: { vi: 'Frontend', en: 'Frontend' },
  backend: { vi: 'Backend', en: 'Backend' },
  database: { vi: 'Database', en: 'Database' },
  devops: { vi: 'DevOps', en: 'DevOps' },
  ai: { vi: 'AI/ML', en: 'AI/ML' },
  other: { vi: 'Khác', en: 'Other' },
}

export function TechStackBadges({
  technologies,
  maxDisplay = 6,
  className,
}: TechStackBadgesProps) {
  if (!technologies || technologies.length === 0) return null

  const displayTechs = technologies.slice(0, maxDisplay)
  const remaining = technologies.length - maxDisplay

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {displayTechs.map((tech, index) => {
        const colorClass = categoryColors[tech.category] || categoryColors.other
        return (
          <Badge
            key={`${tech.name}-${index}`}
            variant="secondary"
            className={cn('text-xs font-medium', colorClass)}
            title={categoryLabels[tech.category]?.en || tech.category}
          >
            {tech.name}
          </Badge>
        )
      })}
      {remaining > 0 && (
        <Badge variant="outline" className="text-xs">
          +{remaining}
        </Badge>
      )}
    </div>
  )
}
