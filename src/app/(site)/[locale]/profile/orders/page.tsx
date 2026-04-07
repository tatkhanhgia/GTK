import { getSession } from '@/lib/auth/auth-helpers'
import { getUserOrders } from '@/lib/profile/get-user-orders'
import { formatDate, formatPrice } from '@/lib/utils'

interface Props {
  params: Promise<{ locale: string }>
}

/**
 * Full order history page — shows all orders with line items.
 * Auth guard is in the parent profile layout.
 */
export default async function OrdersPage({ params }: Props) {
  const { locale } = await params
  const isVi = locale === 'vi'
  const session = await getSession()
  if (!session) return null

  const orders = await getUserOrders(session.user.id)

  return (
    <div>
      <h2 className="font-heading font-semibold text-xl mb-6">
        {isVi ? 'Lịch sử đơn hàng' : 'Order History'}
      </h2>

      {orders.length === 0 ? (
        <p className="text-muted-foreground text-sm py-8 text-center">
          {isVi ? 'Bạn chưa có đơn hàng nào.' : 'No orders yet.'}
        </p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-border bg-card p-5">
              {/* Order header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground font-mono">
                    #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDate(order.createdAt.toISOString(), locale)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatPrice(order.total, order.currency, locale)}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${
                      order.status === 'fulfilled'
                        ? 'bg-success/10 text-success'
                        : order.status === 'paid'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Line items */}
              <ul className="space-y-2">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between text-sm">
                    <span>{item.productName}</span>
                    <span className="text-muted-foreground">
                      {formatPrice(item.price, item.currency, locale)}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Link to downloads for fulfilled orders */}
              {order.status === 'fulfilled' && (
                <div className="mt-4 pt-4 border-t border-border">
                  <a
                    href={`/${locale}/profile/downloads`}
                    className="text-sm text-primary hover:underline"
                  >
                    {isVi ? 'Đến trang tải xuống →' : 'Go to downloads →'}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
