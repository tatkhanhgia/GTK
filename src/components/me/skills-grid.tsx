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

export function SkillsGrid({ skills, locale }: SkillsGridProps) {
  return (
    <section>
      <h2 className="font-heading font-bold text-2xl mb-3">
        {locale === 'vi' ? 'Công cụ mình hay dùng' : 'Tools I keep reaching for'}
      </h2>
      <p className="mb-8 text-sm leading-relaxed text-muted-foreground md:text-base">
        {locale === 'vi'
          ? 'Không phải checklist kỹ năng. Đây là những công cụ mình thường dùng khi cần đi từ ý tưởng đến sản phẩm chạy được.'
          : 'Not a skills checklist. These are tools I reach for when turning ideas into working products.'}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {skills.map((group) => (
          <div key={group.category}>
            <h3 className="font-medium text-lg mb-3">{group.category}</h3>
            <div className="flex flex-wrap gap-2">
              {group.items?.map((item) => (
                <span
                  key={item.name}
                  className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm"
                >
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
