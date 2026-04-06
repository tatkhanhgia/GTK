import { Brain, Code2, Lightbulb, Package } from 'lucide-react'

interface TopicsGridProps {
  locale: string
}

const topics = [
  {
    icon: Brain,
    titleVi: 'AI & Machine Learning',
    titleEn: 'AI & Machine Learning',
    descVi: 'Ứng dụng AI thực tế, workflow làm việc và cách biến ý tưởng thành sản phẩm hữu ích.',
    descEn: 'Practical AI use cases, workflows, and how to turn ideas into useful products.',
  },
  {
    icon: Code2,
    titleVi: 'Lập trình',
    titleEn: 'Programming',
    descVi: 'Next.js, backend, automation và những quyết định kỹ thuật có thể áp dụng ngay.',
    descEn: 'Next.js, backend, automation, and implementation choices you can apply right away.',
  },
  {
    icon: Package,
    titleVi: 'Sản phẩm số',
    titleEn: 'Digital Products',
    descVi: 'Tư duy đóng gói, bán và cải tiến sản phẩm số theo hướng bền vững.',
    descEn: 'How to package, ship, and improve digital products in a sustainable way.',
  },
  {
    icon: Lightbulb,
    titleVi: 'Công nghệ',
    titleEn: 'Technology',
    descVi: 'Những ghi chú chọn lọc về công cụ, hệ thống và xu hướng đáng để theo dõi.',
    descEn: 'Curated notes on tools, systems, and trends worth paying attention to.',
  },
]

export function TopicsGrid({ locale }: TopicsGridProps) {
  const isVi = locale === 'vi'

  return (
    <section>
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
          {isVi ? 'Chủ đề chính' : 'Core topics'}
        </p>
        <h2 className="mt-3 font-heading text-2xl font-semibold md:text-3xl">
          {isVi ? 'GTKBlog viết về điều gì?' : 'What does GTKBlog cover?'}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {topics.map((topic) => {
          const Icon = topic.icon
          return (
            <article
              key={topic.titleEn}
              className="rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md"
            >
              <Icon className="h-8 w-8 text-primary" />
              <h3 className="mt-4 font-heading text-base font-semibold">
                {isVi ? topic.titleVi : topic.titleEn}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {isVi ? topic.descVi : topic.descEn}
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
