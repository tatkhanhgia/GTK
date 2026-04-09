import Image from 'next/image'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function LogoShowcasePage({ params }: Props) {
  const { locale } = await params

  const logos = [
    { id: 'v1', name: 'Geometric GB', desc: 'Chữ G và B đan xen hình học' },
    { id: 'v2', name: 'Code Pen', desc: 'Bút và dấu ngoặc code' },
    { id: 'v3', name: 'Hexagon G', desc: 'Chữ G trong lục giác' },
    { id: 'v4', name: 'Wordmark', desc: 'Chữ GTK Blog đầy đủ' },
  ]

  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-20">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="mb-4 font-heading text-3xl font-bold">
          Logo <span className="gradient-text-brand">GTKBlog</span>
        </h1>
        <p className="mb-12 text-muted-foreground">
          {locale === 'vi'
            ? 'Chọn 1 trong 4 thiết kế logo dưới đây để sử dụng cho project'
            : 'Choose one of the 4 logo designs below for your project'}
        </p>

        <div className="grid gap-8 md:grid-cols-2">
          {logos.map((logo) => (
            <div
              key={logo.id}
              className="flex flex-col items-center rounded-xl border border-border bg-card p-8 transition-shadow hover:shadow-lg"
            >
              <div className="mb-4 flex h-32 items-center justify-center rounded-lg bg-secondary/50 p-6">
                <Image
                  src={`/logo-gtkblog-${logo.id}.svg`}
                  alt={`Logo ${logo.name}`}
                  width={logo.id === 'v4' ? 200 : 120}
                  height={logo.id === 'v4' ? 80 : 120}
                  className={logo.id === 'v4' ? 'h-16 w-auto' : 'h-24 w-24'}
                />
              </div>
              <h3 className="mb-1 font-heading text-lg font-semibold">{logo.name}</h3>
              <p className="text-sm text-muted-foreground">{logo.desc}</p>
              <code className="mt-4 rounded bg-muted px-2 py-1 text-xs">
                logo-gtkblog-{logo.id}.svg
              </code>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-xl border border-border bg-secondary/30 p-8">
          <h2 className="mb-4 font-heading text-xl font-semibold">
            {locale === 'vi' ? 'Cách sử dụng' : 'How to use'}
          </h2>
          <div className="text-left text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>1. Logo inline (mặc định):</strong> Đã được tích hợp sẵn trong Navbar
            </p>
            <p className="mb-2">
              <strong>2. Logo component:</strong> Sử dụng <code>Logo</code> component với prop variant
            </p>
            <pre className="mt-4 overflow-x-auto rounded-lg bg-muted p-4 text-xs">
              {`import { Logo } from '@/components/layout/logo'

// Sử dụng các variant
<Logo variant="v1" />
<Logo variant="v2" />
<Logo variant="v3" />
<Logo variant="v4" />`}
            </pre>
          </div>
        </div>
      </div>
    </main>
  )
}
