'use client'

import { Loader2, MessageSquareText, Plus, Trash2 } from 'lucide-react'
import type { AdminAiSessionDetail } from '@/lib/admin-ai/admin-ai-chat-contract'

type Props = {
  sessions: AdminAiSessionDetail[]
  activeSessionId?: string
  isLoading?: boolean
  busySessionId?: string | null
  onCreateSession: () => void
  onOpenSession: (id: string) => void
  onDeleteSession: (id: string) => void
}

function formatSessionTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Chưa có tin nhắn'
  return date.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export function AdminAiSessionPanel({
  sessions,
  activeSessionId,
  isLoading = false,
  busySessionId,
  onCreateSession,
  onOpenSession,
  onDeleteSession,
}: Props) {
  return (
    <aside className="border-b border-[var(--admin-border)] bg-[var(--admin-bg-secondary)] p-4 lg:w-[312px] lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-[var(--admin-text-primary)]">Session history</h2>
          <p className="mt-1 text-xs leading-5 text-[var(--admin-text-secondary)]">
            Mở lại hoặc xóa phiên chat đã lưu.
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateSession}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-[var(--admin-accent)] text-[var(--admin-bg-elevated)] transition hover:bg-[var(--admin-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-accent)]"
          aria-label="Tạo phiên AI mới"
        >
          <Plus className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {isLoading && (
          <div className="flex min-h-24 items-center justify-center text-[var(--admin-text-secondary)]">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          </div>
        )}
        {!isLoading && sessions.length === 0 && (
          <div className="rounded-lg border border-dashed border-[var(--admin-border)] bg-[var(--admin-bg-tertiary)] p-4 text-sm leading-6 text-[var(--admin-text-secondary)]">
            Chưa có session. Gửi tin nhắn đầu tiên để lưu lịch sử.
          </div>
        )}
        {!isLoading && sessions.map((session) => {
          const isActive = session.id === activeSessionId
          const isBusy = busySessionId === session.id

          return (
            <div
              key={session.id}
              className={`group rounded-lg border p-2 transition ${
                isActive
                  ? 'border-[var(--admin-accent)] bg-[var(--admin-accent-light)]'
                  : 'border-[var(--admin-border)] bg-[var(--admin-bg-tertiary)] hover:border-[var(--admin-border-strong)]'
              }`}
            >
              <button
                type="button"
                onClick={() => onOpenSession(session.id)}
                className="flex min-h-14 w-full items-start gap-3 rounded-md p-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-accent)]"
              >
                <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-[var(--admin-accent)]" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 block text-sm font-medium leading-5 text-[var(--admin-text-primary)]">
                    {session.title}
                  </span>
                  <span className="mt-1 block text-xs text-[var(--admin-text-secondary)]">
                    {formatSessionTime(session.lastMessageAt)} · {session.messageCount} tin
                  </span>
                </span>
              </button>
              <div className="flex justify-end px-1 pb-1">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => onDeleteSession(session.id)}
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-xs font-medium text-[var(--admin-error)] transition hover:bg-[var(--admin-error)]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-error)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
                  Xóa
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
