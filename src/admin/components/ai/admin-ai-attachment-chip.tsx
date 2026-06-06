'use client'

import { AlertCircle, FileText, Loader2, X } from 'lucide-react'
import type { AdminAiAttachment } from '@/lib/admin-ai/admin-ai-chat-contract'

type Props = {
  attachment: AdminAiAttachment
  variant?: 'composer' | 'message'
  disabled?: boolean
  onRemove?: (referenceId: string) => void
}

function formatBytes(value?: number) {
  if (!value) return ''
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`
  return `${(value / 1024 / 1024).toFixed(1)} MB`
}

export function AdminAiAttachmentChip({ attachment, variant = 'composer', disabled, onRemove }: Props) {
  const isMessage = variant === 'message'
  const isUploading = attachment.status === 'uploading'
  const isError = attachment.status === 'failed' || attachment.status === 'deleted'
  const Icon = isUploading ? Loader2 : isError ? AlertCircle : FileText
  const tone = isMessage
    ? 'border-white/25 bg-white/15 text-[var(--admin-bg-elevated)]'
    : isError
      ? 'border-[var(--admin-danger)]/30 bg-[var(--admin-danger)]/10 text-[var(--admin-danger)]'
      : 'border-[var(--admin-border)] bg-[var(--admin-bg-secondary)] text-[var(--admin-text-primary)]'

  return (
    <span
      className={`inline-flex min-h-8 max-w-[240px] items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs ${tone}`}
      title={attachment.error || attachment.filename}
    >
      <Icon className={`h-3.5 w-3.5 shrink-0 ${isUploading ? 'animate-spin' : ''}`} aria-hidden="true" />
      <span className="min-w-0 truncate">
        {attachment.filename}
        {formatBytes(attachment.byteSize) ? ` · ${formatBytes(attachment.byteSize)}` : ''}
      </span>
      {onRemove && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onRemove(attachment.referenceId)}
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition hover:bg-black/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-accent)] disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`Gỡ ${attachment.filename}`}
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </span>
  )
}
