'use client'

import { CircleAlert } from 'lucide-react'

type Props = {
  message?: string | null
}

export function AdminAiErrorBanner({ message }: Props) {
  if (!message) return null

  return (
    <div className="border-b border-[var(--admin-border)] bg-[var(--admin-danger)]/10 px-4 py-3 text-sm text-[var(--admin-text-primary)] md:px-6">
      <span className="inline-flex items-center gap-2">
        <CircleAlert className="h-4 w-4 text-[var(--admin-danger)]" aria-hidden="true" />
        {message}
      </span>
    </div>
  )
}
