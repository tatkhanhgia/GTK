import Link from 'next/link'
import { BookOpenText, Hammer, UserRound } from 'lucide-react'
import type { Locale } from '@/i18n/config'

interface StartHereItem {
  title: string
  description: string
  href: string
  action: string
  icon: 'writing' | 'building' | 'author'
}

interface HomepageStartHereSectionProps {
  locale: Locale
}

const iconMap = {
  writing: BookOpenText,
  building: Hammer,
  author: UserRound,
}

function getStartHereCopy(locale: Locale) {
  const isVi = locale === 'vi'

  return {
    eyebrow: isVi ? 'Bắt đầu từ đây' : 'Start here',
    title: isVi
      ? 'Ba cách để hiểu GTKBlog nhanh hơn'
      : 'Three ways to understand GTKBlog faster',
    subtitle: isVi
      ? 'Homepage này không cố gom mọi bài viết. Nó giúp bạn nhận ra tôi đang học, xây và chia sẻ điều gì.'
      : 'This homepage does not try to list everything. It shows what I am learning, building, and sharing.',
    items: [
      {
        title: isVi ? 'Đọc các ghi chép kỹ thuật' : 'Read the technical notes',
        description: isVi
          ? 'Bài viết về AI workflow, Next.js, Payload CMS và những quyết định khi xây sản phẩm thật.'
          : 'Writing about AI workflows, Next.js, Payload CMS, and the decisions behind real products.',
        href: `/${locale}/blog`,
        action: isVi ? 'Vào blog' : 'Open blog',
        icon: 'writing',
      },
      {
        title: isVi ? 'Xem tôi đang xây gì' : 'See what I am building',
        description: isVi
          ? 'Tài nguyên số, template và source code sinh ra từ quá trình thử nghiệm, không phải demo rỗng.'
          : 'Digital resources, templates, and source code shaped by actual experiments, not empty demos.',
        href: `/${locale}/products`,
        action: isVi ? 'Xem tài nguyên' : 'View resources',
        icon: 'building',
      },
      {
        title: isVi ? 'Hiểu cách tôi làm việc' : 'Understand how I work',
        description: isVi
          ? 'Bối cảnh, nguyên tắc và cách tôi biến kinh nghiệm rời rạc thành hệ thống có thể dùng lại.'
          : 'Context, principles, and how I turn scattered experience into reusable systems.',
        href: `/${locale}/me`,
        action: isVi ? 'Về tác giả' : 'About me',
        icon: 'author',
      },
    ] satisfies StartHereItem[],
  }
}

export function HomepageStartHereSection({ locale }: HomepageStartHereSectionProps) {
  const copy = getStartHereCopy(locale)

  return (
    <section className="border-t border-border bg-secondary/10 px-6 py-14 md:py-18">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:items-start">
        <div>
          <p className="text-sm font-medium text-primary">{copy.eyebrow}</p>
          <h2 className="mt-3 max-w-xl font-heading text-3xl font-bold tracking-tight md:text-4xl">
            {copy.title}
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
            {copy.subtitle}
          </p>
        </div>

        <div className="grid gap-4">
          {copy.items.map((item, index) => {
            const Icon = iconMap[item.icon]

            return (
              <Link
                key={item.href}
                href={item.href}
                className="motion-card group grid gap-4 rounded-xl border border-border/70 bg-card/70 p-5 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-card md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted-foreground">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="font-heading text-lg font-semibold tracking-tight">
                      {item.title}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <span className="text-sm font-medium text-primary transition-transform group-hover:translate-x-1">
                  {item.action}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
