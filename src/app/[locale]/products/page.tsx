import { getProducts } from '@/lib/products/get-products'
import { ProductCard } from '@/components/ui/product-card'
import { Sidebar, SidebarSection } from '@/components/layout/sidebar'
import type { Locale } from '@/i18n/config'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ type?: string; page?: string }>
}

export const revalidate = 60

export default async function ProductsPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { type, page: pageParam } = await searchParams
  const loc = locale as Locale
  const page = pageParam ? parseInt(pageParam) : 1
  const isVi = loc === 'vi'

  const productType = ['ebook', 'template', 'code'].includes(type ?? '')
    ? (type as 'ebook' | 'template' | 'code')
    : undefined

  const result = await getProducts({ locale: loc, type: productType, page })

  const typeFilters = [
    { value: '', label: isVi ? 'Tất cả' : 'All' },
    { value: 'ebook', label: 'Ebook' },
    { value: 'template', label: 'Template' },
    { value: 'code', label: 'Source Code' },
  ]

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl md:text-4xl mb-2">
          {isVi ? 'Sản phẩm số' : 'Digital Products'}
        </h1>
        <p className="text-muted-foreground">
          {isVi
            ? 'Ebook, template và source code chất lượng cao'
            : 'High-quality ebooks, templates, and source code'}
        </p>
      </div>

      {/* Mobile type filter pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {typeFilters.map((f) => (
          <a
            key={f.value}
            href={f.value ? `/${loc}/products?type=${f.value}` : `/${loc}/products`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              (type ?? '') === f.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      <div className="flex gap-8 items-start">
        <div className="flex-1 min-w-0">
          {result.docs.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              {isVi ? 'Chưa có sản phẩm nào.' : 'No products yet.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {result.docs.map((product) => {
                const firstImageBlock = Array.isArray(product.images) && product.images[0]
                  ? (product.images[0] as { image: unknown }).image
                  : null
                const firstImage =
                  firstImageBlock && typeof firstImageBlock === 'object'
                    ? {
                        url: (firstImageBlock as { url?: string }).url ?? '',
                        alt: product.slug,
                      }
                    : null

                return (
                  <ProductCard
                    key={product.id}
                    name={typeof product.name === 'string' ? product.name : String(product.name)}
                    slug={product.slug}
                    excerpt={typeof product.excerpt === 'string' ? product.excerpt : undefined}
                    image={firstImage}
                    priceUSD={product.priceUSD}
                    priceVND={product.priceVND}
                    type={product.type}
                    locale={loc}
                  />
                )
              })}
            </div>
          )}
        </div>

        {/* Desktop sidebar */}
        <Sidebar className="hidden lg:block">
          <SidebarSection title={isVi ? 'Loại sản phẩm' : 'Product Type'}>
            <ul className="space-y-2">
              {typeFilters.slice(1).map((f) => (
                <li key={f.value}>
                  <a
                    href={`/${loc}/products?type=${f.value}`}
                    className={`text-sm transition-colors ${
                      type === f.value
                        ? 'text-primary font-medium'
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                  >
                    {f.label}
                  </a>
                </li>
              ))}
            </ul>
          </SidebarSection>
        </Sidebar>
      </div>
    </div>
  )
}
