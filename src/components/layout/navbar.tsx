'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { LogoInline } from '@/components/layout/logo'
import { usePathname } from 'next/navigation'
import { locales } from '@/i18n/config'

const navLinks = [
  { href: '/blog', label: 'Blog', labelVi: 'Blog' },
  { href: '/products', label: 'Products', labelVi: 'Sản phẩm' },
  { href: '/about', label: 'About', labelVi: 'Về blog' },
  { href: '/me', label: 'Me', labelVi: 'Tác giả' },
]

interface NavbarProps {
  locale?: string
}

export function Navbar({ locale = 'vi' }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  // Use raw Next pathname so locale stripping does not depend on next-intl client state.
  // Example: on /en/me we get "/en/me" — replace segment[0] with otherLocale → "/vi/me".
  const rawPathname = usePathname() ?? `/${locale}`
  const otherLocale: 'vi' | 'en' = locale === 'vi' ? 'en' : 'vi'
  const segments = rawPathname.split('/').filter(Boolean)
  if (segments.length > 0 && (locales as readonly string[]).includes(segments[0])) {
    segments[0] = otherLocale
  } else {
    segments.unshift(otherLocale)
  }
  const switchHref = '/' + segments.join('/')

  useEffect(() => {
    let frame = 0

    function updateScrollState() {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 12)
      })
    }

    updateScrollState()
    window.addEventListener('scroll', updateScrollState, { passive: true })

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', updateScrollState)
    }
  }, [])

  return (
    <header
      className={cn(
        'motion-surface sticky top-0 z-50 w-full border-b backdrop-blur-lg',
        isScrolled
          ? 'border-border/70 bg-background/95 shadow-[0_10px_30px_color-mix(in_oklab,var(--foreground)_6%,transparent)]'
          : 'border-border/40 bg-background/80'
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        {/* Logo */}
        <LogoInline showText href={`/${locale}`} />

        {/* Desktop Nav — center */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={`/${locale}${link.href}`}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-fast ease-enter',
                'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              {locale === 'vi' ? link.labelVi : link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions — right */}
        <div className="hidden md:flex items-center gap-2">
          {/* Language switcher — navigates to the same page in the other locale */}
          <Link
            href={switchHref}
            prefetch={false}
            aria-label={`Switch language to ${otherLocale === 'vi' ? 'Vietnamese' : 'English'}`}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'text-xs font-medium'
            )}
          >
            {locale === 'vi' ? 'EN' : 'VI'}
          </Link>
          <ThemeToggle />
          {/* Use <a> styled as button since base-nova Button has no asChild prop */}
          <Link
            href="/login"
            className={cn(buttonVariants({ size: 'sm' }))}
          >
            {locale === 'vi' ? 'Đăng nhập' : 'Login'}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            {/* SheetTrigger renders as <button> natively via @base-ui/react */}
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              }
            />
            <SheetContent side="right" className="w-[280px]">
              <nav className="flex flex-col gap-2 mt-6" aria-label="Mobile navigation">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={`/${locale}${link.href}`}
                    onClick={() => setIsOpen(false)}
                    className="motion-surface rounded-lg px-4 py-3 font-medium hover:bg-secondary"
                  >
                    {locale === 'vi' ? link.labelVi : link.label}
                  </Link>
                ))}
                <div className="pt-4 border-t border-border flex flex-col gap-2">
                  <Link
                    href={switchHref}
                    prefetch={false}
                    onClick={() => setIsOpen(false)}
                    aria-label={`Switch language to ${otherLocale === 'vi' ? 'Vietnamese' : 'English'}`}
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      'w-full justify-center'
                    )}
                  >
                    {locale === 'vi' ? 'English' : 'Tiếng Việt'}
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className={cn(buttonVariants(), 'w-full justify-center')}
                  >
                    {locale === 'vi' ? 'Đăng nhập' : 'Login'}
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
