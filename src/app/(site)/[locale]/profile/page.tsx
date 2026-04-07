import { getSession } from '@/lib/auth/auth-helpers'
import { getUserOrders } from '@/lib/profile/get-user-orders'
import { formatDate, formatPrice } from '@/lib/utils'
import { ShoppingBag, Download, User } from 'lucide-react'
import Link from 'next/link'

interface Props {
  params: Promise<{ locale: string }>
}

/**
 * Profile overview: user info card, quick stats, last 5 orders.
 * Auth guard is in the parent layout — this page can assume session exists.
 */
export default async function ProfilePage({ params }: Props) {
  const { locale } = await params
  const isVi = locale === 'vi'
  const session = await getSession()
  if (!session) return null

  const orders = await getUserOrders(session.user.id)
  const fulfilledOrders = orders.filter((o) => o.status === 'fulfilled')
  const recentOrders = orders.slice(0, 5)

  return (
    <div className="space-y-8">
      {/* User info card */}
      <div className="rounded-xl border border-border bg-card p-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <User className="h-7 w-7 text-primary" />
        </div>
        <div>
          <p className="font-heading font-semibold text-lg">{session.user.name}</p>
          <p className="text-sm text-muted-foreground">{session.user.email}</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <ShoppingBag className="h-4 w-4" />
            <span className="text-sm">{isVi ? 'Đơn hàng' : 'Orders'}</span>
          </div>
          <p className="font-heading font-bold text-2xl">{fulfilledOrders.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Download className="h-4 w-4" />
            <span className="text-sm">{isVi ? 'Sản phẩm' : 'Products'}</span>
          </div>
          <p className="font-heading font-bold text-2xl">
            {fulfilledOrders.reduce((sum, o) => sum + o.items.length, 0)}
          </p>
        </div>
      </div>

      {/* Recent orders */}
      {recentOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold">
              {isVi ? 'Đơn hàng gần đây' : 'Recent Orders'}
            </h2>
            <Link
              href={`/${locale}/profile/orders`}
              className="text-sm text-primary hover:underline"
            >
              {isVi ? 'Xem tất cả' : 'View all'}
            </Link>
          </div>
          <ul className="space-y-3">
            {recentOrders.map((order) => (
              <li key={order.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">
                      {order.items[0]?.productName ?? 'Order'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(order.createdAt.toISOString(), locale)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatPrice(order.total, order.currency, locale)}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        order.status === 'fulfilled'
                          ? 'bg-success/10 text-success'
                          : 'bg-warning/10 text-warning'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
