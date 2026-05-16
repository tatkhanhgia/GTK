import Link from 'next/link'
// lucide-react v1 removed Github/Twitter/Linkedin — use available alternatives
import { GitBranch, X, ExternalLink, Rss } from 'lucide-react'

interface FooterProps {
  locale?: string
}

export function Footer({ locale = 'vi' }: FooterProps) {
  const isVi = locale === 'vi'

  return (
    <footer className="mt-24 bg-[#1A1715] text-[#FAF8F5] dark:bg-[#0F0D0B]">
      <div className="mx-auto max-w-[1200px] px-6 py-14 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-8 lg:gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="font-heading text-2xl font-bold text-[#FAF8F5] transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-[#1A1715]"
            >
              GTKBlog
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-[#B8AEA5]">
              {isVi
                ? 'Blog công nghệ & AI cá nhân. Chia sẻ kiến thức, sản phẩm số.'
                : 'Personal tech & AI blog. Sharing knowledge and digital products.'}
            </p>
          </div>

          {/* Explore links */}
          <div>
            <h4 className="mb-4 font-heading text-sm font-semibold text-[#FAF8F5]">
              {isVi ? 'Khám phá' : 'Explore'}
            </h4>
            <ul className="space-y-3 text-sm text-[#B8AEA5]">
              {[
                { href: '/blog', label: isVi ? 'Blog' : 'Blog' },
                { href: '/products', label: isVi ? 'Sản phẩm' : 'Products' },
                { href: '/about', label: isVi ? 'Về blog' : 'About' },
                { href: '/me', label: isVi ? 'Tác giả' : 'Me' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={`/${locale}${link.href}`}
                    className="inline-flex min-h-6 items-center transition-colors hover:text-[#FAF8F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-[#1A1715]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h4 className="mb-4 font-heading text-sm font-semibold text-[#FAF8F5]">
              {isVi ? 'Pháp lý' : 'Legal'}
            </h4>
            <ul className="space-y-3 text-sm text-[#B8AEA5]">
              {[
                { href: '/privacy', label: isVi ? 'Chính sách bảo mật' : 'Privacy Policy' },
                { href: '/terms', label: isVi ? 'Điều khoản' : 'Terms' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={`/${locale}${link.href}`}
                    className="inline-flex min-h-6 items-center transition-colors hover:text-[#FAF8F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-[#1A1715]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social links */}
          <div>
            <h4 className="mb-4 font-heading text-sm font-semibold text-[#FAF8F5]">
              {isVi ? 'Kết nối' : 'Connect'}
            </h4>
            <div className="flex gap-3">
              {[
                { icon: GitBranch, href: 'https://github.com', label: 'GitHub' },
                { icon: X, href: 'https://twitter.com', label: 'Twitter' },
                { icon: ExternalLink, href: 'https://linkedin.com', label: 'LinkedIn' },
                { icon: Rss, href: `/${locale}/blog/feed.xml`, label: 'RSS' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  aria-label={label}
                  className="inline-flex size-11 items-center justify-center rounded-lg border border-white/10 text-[#B8AEA5] transition-colors hover:border-primary/50 hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-[#1A1715]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-[#B8AEA5] sm:flex-row">
          <p>© {new Date().getFullYear()} GTKBlog. {isVi ? 'Bảo lưu mọi quyền.' : 'All rights reserved.'}</p>
          <p>{isVi ? 'Được xây dựng với Next.js & Payload CMS' : 'Built with Next.js & Payload CMS'}</p>
        </div>
      </div>
    </footer>
  )
}
