import Link from 'next/link'

interface AboutHeroSectionProps {
  locale: string
}

export function AboutHeroSection({ locale }: AboutHeroSectionProps) {
  const isVi = locale === 'vi'

  return (
    <section className="gradient-brand-subtle relative overflow-hidden rounded-3xl border border-border/60 px-6 py-14 md:px-10 md:py-16">
      <div className="ambient-warm absolute inset-0" />
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
          {isVi ? 'Giới thiệu' : 'About'}
        </p>
        <h1 className="mt-4 font-heading text-4xl font-bold md:text-5xl">
          <span className="gradient-text-brand">GTKBlog</span>
        </h1>
        <p className="mt-4 text-lg text-foreground/90 md:text-xl">
          {isVi ? 'Blog công nghệ, AI và sản phẩm số theo góc nhìn cá nhân.' : 'A personal blog about technology, AI, and digital products.'}
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {isVi
            ? 'Nơi mình ghi lại kiến thức, chia sẻ trải nghiệm xây dựng sản phẩm, và hệ thống hóa những điều đáng học trong quá trình làm nghề.'
            : 'A place where I document knowledge, share product-building lessons, and turn day-to-day work into practical write-ups.'}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {isVi ? 'Khám phá bài viết' : 'Explore posts'}
          </Link>
          <Link
            href={`/${locale}/me`}
            className="inline-flex items-center justify-center rounded-full border border-border bg-background/80 px-5 py-3 text-sm font-medium transition-colors hover:bg-background"
          >
            {isVi ? 'Xem trang tác giả' : 'View author page'}
          </Link>
        </div>
      </div>
    </section>
  )
}
