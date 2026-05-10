interface SkillItem {
  name: string
}

interface SkillCategory {
  category: string
  items?: SkillItem[]
}

interface SkillsGridProps {
  skills: SkillCategory[]
  locale: string
}

export function SkillsGrid({ skills }: SkillsGridProps) {
  return (
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {skills.map((group) => (
          <div key={group.category}>
            <h3 className="font-medium text-lg mb-3">{group.category}</h3>
            <div className="flex flex-wrap gap-2">
              {group.items?.map((item) => (
                <span
                  key={item.name}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10 px-3 py-1.5 text-sm font-medium text-foreground transition-[background-color,border-color] duration-200 ease-enter hover:border-primary/40 hover:from-primary/15 hover:to-accent/15"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {item.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
