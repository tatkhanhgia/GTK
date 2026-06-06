'use client'

import { Bot, CheckCircle2, Clock3, FileText, UserRound } from 'lucide-react'
import type { AdminAiAttachment, AdminAiPendingAction, AdminAiToolResult } from '@/lib/admin-ai/admin-ai-chat-contract'
import { AdminAiAttachmentChip } from './admin-ai-attachment-chip'
import { AdminAiFormattedMessage } from './admin-ai-formatted-message'

export type AdminAiMessage = {
  id: string
  role: 'assistant' | 'user'
  body: string
  status?: 'read' | 'pending-write'
  attachments?: AdminAiAttachment[]
  pendingActions?: AdminAiPendingAction[]
  toolResults?: AdminAiToolResult[]
}

type Props = {
  messages: AdminAiMessage[]
  busyActionId?: string | null
  onConfirmAction: (id: string) => void
  onCancelAction: (id: string) => void
}

function ToolPreview({
  actions,
  busyActionId,
  onConfirmAction,
  onCancelAction,
}: {
  actions: AdminAiPendingAction[]
  busyActionId?: string | null
  onConfirmAction: (id: string) => void
  onCancelAction: (id: string) => void
}) {
  if (actions.length === 0) return null

  return (
    <div className="mt-4 space-y-4 border-t border-[var(--admin-border)] pt-4">
      {actions.map((action) => {
        const isBusy = busyActionId === action.id
        return (
          <div key={action.id}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--admin-warning)]/15 text-[var(--admin-warning)]">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--admin-text-primary)]">{action.summary}</p>
            <p className="mt-1 text-xs leading-5 text-[var(--admin-text-secondary)]">
              Tool: {action.toolName}. Het han: {new Date(action.expiresAt).toLocaleTimeString('vi-VN')}.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--admin-warning)]/15 px-3 py-1 text-xs font-medium text-[var(--admin-warning)]">
          <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
          Chờ duyệt
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          disabled={isBusy}
          onClick={() => onConfirmAction(action.id)}
          className="min-h-10 rounded-lg bg-[var(--admin-accent)] px-3 text-sm font-medium text-[var(--admin-bg-elevated)] transition hover:bg-[var(--admin-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-accent)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy ? 'Đang xử lý' : 'Duyệt'}
        </button>
        <button
          disabled={isBusy}
          onClick={() => onCancelAction(action.id)}
          className="min-h-10 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-tertiary)] px-3 text-sm font-medium text-[var(--admin-text-primary)] transition hover:border-[var(--admin-border-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-accent)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Hủy
        </button>
      </div>
          </div>
        )
      })}
    </div>
  )
}

function ToolResults({ results }: { results: AdminAiToolResult[] }) {
  if (results.length === 0) return null

  return (
    <div className="mt-4 space-y-3 border-t border-[var(--admin-border)] pt-4">
      {results.map((result) => (
        <div key={result.toolName} className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-tertiary)] p-3">
          <p className="text-xs font-semibold uppercase text-[var(--admin-text-secondary)]">{result.toolName}</p>
          <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-[var(--admin-text-primary)]">
            {JSON.stringify(result.output, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  )
}

export function AdminAiMessageList({ messages, busyActionId, onConfirmAction, onCancelAction }: Props) {
  return (
    <div className="flex-1 space-y-4 overflow-y-auto bg-[var(--admin-bg-primary)] p-4 md:p-6" aria-live="polite">
      {messages.map((message) => {
        const isAssistant = message.role === 'assistant'
        const Icon = isAssistant ? Bot : UserRound

        return (
          <article key={message.id} className={`flex gap-3 ${isAssistant ? '' : 'justify-end'}`}>
            {isAssistant && (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--admin-accent-light)] text-[var(--admin-accent)]">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
            )}
            <div className={`max-w-[760px] rounded-xl border px-4 py-3 text-sm leading-6 shadow-[var(--admin-shadow-sm)] ${
              isAssistant
                ? 'border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] text-[var(--admin-text-primary)]'
                : 'border-[var(--admin-accent)] bg-[var(--admin-accent)] text-[var(--admin-bg-elevated)]'
            }`}>
              <AdminAiFormattedMessage body={message.body} />
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.attachments.map((attachment) => (
                    <AdminAiAttachmentChip
                      key={attachment.referenceId}
                      attachment={attachment}
                      variant={isAssistant ? 'composer' : 'message'}
                    />
                  ))}
                </div>
              )}
              {message.status === 'read' && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-[var(--admin-success)]">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Chỉ đọc
                </p>
              )}
              {message.toolResults && <ToolResults results={message.toolResults} />}
              {message.pendingActions && (
                <ToolPreview
                  actions={message.pendingActions}
                  busyActionId={busyActionId}
                  onConfirmAction={onConfirmAction}
                  onCancelAction={onCancelAction}
                />
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}
