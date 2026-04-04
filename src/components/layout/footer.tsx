import Link from 'next/link'
// lucide-react v1 removed Github/Twitter/Linkedin — use available alternatives
import { GitBranch, X, ExternalLink, Rss } from 'lucide-react'

interface FooterProps {
  locale?: string
}

export function Footer({ locale = 'vi' }: FooterProps) {
  const isVi = locale === 'vi'

  return (
    <footer className="border-t border-border bg-secondary/30 mt-20">
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="font-heading font-bold text-xl gradient-text-brand">
              GTKBlog
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {isVi
                ? 'Blog công nghệ & AI cá nhân. Chia sẻ kiến thức, sản phẩm số.'
                : 'Personal tech & AI blog. Sharing knowledge and digital products.'}
            </p>
          </div>

          {/* Explore links */}
          <div>
            <h4 className="font-heading font-semibold text-sm mb-4">
              {isVi ? 'Khám phá' : 'Explore'}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                { href: '/blog', label: isVi ? 'Blog' : 'Blog' },
                { href: '/products', label: isVi ? 'Sản phẩm' : 'Products' },
                { href: '/about', label: isVi ? 'Về mình' : 'About' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={`/${locale}${link.href}`} className="hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h4 className="font-heading font-semibold text-sm mb-4">
              {isVi ? 'Pháp lý' : 'Legal'}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                { href: '/privacy', label: isVi ? 'Chính sách bảo mật' : 'Privacy Policy' },
                { href: '/terms', label: isVi ? 'Điều khoản' : 'Terms' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={`/${locale}${link.href}`} className="hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social links */}
          <div>
            <h4 className="font-heading font-semibold text-sm mb-4">
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
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} GTKBlog. {isVi ? 'Bảo lưu mọi quyền.' : 'All rights reserved.'}</p>
          <p>{isVi ? 'Được xây dựng với Next.js & Payload CMS' : 'Built with Next.js & Payload CMS'}</p>
        </div>
      </div>
    </footer>
  )
}
