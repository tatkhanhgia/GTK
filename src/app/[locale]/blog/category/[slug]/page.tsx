import { redirect } from 'next/navigation'
import type { Locale } from '@/i18n/config'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export const revalidate = 60

export default async function CategoryPage({ params }: Props) {
  const { locale, slug } = await params
  const loc = locale as Locale

  redirect(`/${loc}/blog?category=${slug}`)
}
