import Link from 'next/link'

export default function AdminNotFoundPage() {
  return (
    <main className="min-h-screen bg-[var(--admin-bg-primary)] px-6 py-10 text-[var(--admin-text-primary)]">
      <div className="mx-auto max-w-2xl rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-6 shadow-[var(--admin-shadow-sm)]">
        <p className="text-xs font-semibold uppercase text-[var(--admin-text-muted)]">Admin</p>
        <h1 className="mt-2 text-2xl font-semibold">Không tìm thấy trang</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--admin-text-secondary)]">
          Trang quản trị này không tồn tại hoặc tài liệu đã bị xóa.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/admin"
            className="inline-flex min-h-10 items-center rounded-lg bg-[var(--admin-accent)] px-4 text-sm font-medium text-white"
          >
            Về dashboard
          </Link>
          <Link
            href="/admin/ai"
            className="inline-flex min-h-10 items-center rounded-lg border border-[var(--admin-border)] px-4 text-sm font-medium"
          >
            Mở AI Console
          </Link>
        </div>
      </div>
    </main>
  )
}
