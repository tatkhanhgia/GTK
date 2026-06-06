'use client'

import Link from 'next/link'
import { KeyRound } from 'lucide-react'

export function AdminAiEmptyProfileState() {
  return (
    <div className="border-b border-[var(--admin-border)] bg-[var(--admin-warning)]/10 px-4 py-3 text-sm text-[var(--admin-text-primary)] md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-[var(--admin-warning)]" aria-hidden="true" />
          Chưa có AI profile bật. Tạo profile để chat với provider.
        </span>
        <Link
          href="/admin/collections/admin-ai-profiles"
          className="inline-flex min-h-9 items-center rounded-lg bg-[var(--admin-accent)] px-3 text-sm font-medium text-[var(--admin-bg-elevated)] hover:bg-[var(--admin-accent-hover)]"
        >
          Quản lý profiles
        </Link>
      </div>
    </div>
  )
}
