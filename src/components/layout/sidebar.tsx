import { cn } from '@/lib/utils'

interface SidebarProps {
  children: React.ReactNode
  className?: string
}

export function Sidebar({ children, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        'w-full lg:w-[280px] xl:w-[320px] shrink-0',
        className
      )}
    >
      <div className="sticky top-24 space-y-6">
        {children}
      </div>
    </aside>
  )
}

interface SidebarSectionProps {
  title: string
  children: React.ReactNode
}

export function SidebarSection({ title, children }: SidebarSectionProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
        {title}
      </h3>
      {children}
    </div>
  )
}
