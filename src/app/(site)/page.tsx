import { redirect } from 'next/navigation'

// Root page redirects to default locale (vi)
// All content lives under /[locale]/* routes
export default function RootPage() {
  redirect('/vi')
}
