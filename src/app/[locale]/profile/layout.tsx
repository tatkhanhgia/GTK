import { requireAuth } from '@/lib/auth/auth-helpers'
import Link from 'next/link'
import { LayoutDashboard, ShoppingBag, Download, Settings } from 'lucide-react'

interface Props {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

/**
 * Protected profile layout with sidebar tab navigation.
 * requireAuth() redirects to /[locale]/login if unauthenticated.
 */
export default async function ProfileLayout({ children, params }: Props) {
  const { locale } = await params
  await requireAuth(locale)

  const isVi = locale === 'vi'

  const tabs = [
    { href: `/${locale}/profile`, icon: LayoutDashboard, label: isVi ? 'Tổng quan' : 'Overview' },
    { href: `/${locale}/profile/orders`, icon: ShoppingBag, label: isVi ? 'Đơn hàng' : 'Orders' },
    { href: `/${locale}/profile/downloads`, icon: Download, label: isVi ? 'Tải xuống' : 'Downloads' },
    { href: `/${locale}/profile/settings`, icon: Settings, label: isVi ? 'Cài đặt' : 'Settings' },
  ]

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10">
      <h1 className="font-heading font-bold text-2xl mb-8">
        {isVi ? 'Tài khoản' : 'Account'}
      </h1>
      <div className="flex gap-8 items-start">
        {/* Sidebar tab navigation — hidden on mobile */}
        <nav className="w-52 shrink-0 hidden md:block">
          <ul className="space-y-1">
            {tabs.map(({ href, icon: Icon, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Page content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  )
}
