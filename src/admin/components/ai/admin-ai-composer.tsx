'use client'

import type { FormEvent } from 'react'
import { useRef } from 'react'
import { Paperclip, SendHorizontal, ShieldCheck } from 'lucide-react'
import type { AdminAiAttachment } from '@/lib/admin-ai/admin-ai-chat-contract'
import { AdminAiAttachmentChip } from './admin-ai-attachment-chip'

type Props = {
  attachments?: AdminAiAttachment[]
  disabled?: boolean
  isBusy?: boolean
  isUploadingFile?: boolean
  uploadError?: string | null
  placeholder?: string
  onRemoveAttachment?: (referenceId: string) => void
  onSubmit: (message: string) => void
  onUploadFile?: (file: File) => void
}

export function AdminAiComposer({
  attachments = [],
  disabled = false,
  isBusy = false,
  isUploadingFile = false,
  uploadError,
  placeholder,
  onRemoveAttachment,
  onSubmit,
  onUploadFile,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const field = textareaRef.current
    const message = field?.value.trim() ?? ''
    if (!message || disabled || isBusy || isUploadingFile) return
    onSubmit(message)
    if (field) {
      field.value = ''
      field.focus()
    }
  }

  const handleFileChange = () => {
    const file = fileInputRef.current?.files?.[0]
    if (file && onUploadFile) onUploadFile(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-[var(--admin-border)] bg-[var(--admin-bg-secondary)] p-4">
      <label className="sr-only" htmlFor="admin-ai-message">Tin nhắn cho AI Ops Console</label>
      <div className="flex flex-col gap-3 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-tertiary)] p-3 shadow-[var(--admin-shadow-sm)]">
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown,.html,.htm,.txt,text/plain,text/html,text/markdown"
          className="hidden"
          onChange={handleFileChange}
        />
        <textarea
          ref={textareaRef}
          id="admin-ai-message"
          name="message"
          rows={3}
          disabled={disabled || isBusy}
          placeholder={placeholder ?? 'Hỏi trạng thái site, tìm bài draft, hoặc yêu cầu sửa nội dung...'}
          className="min-h-[92px] resize-none bg-transparent text-sm leading-6 text-[var(--admin-text-primary)] outline-none placeholder:text-[var(--admin-text-muted)] disabled:cursor-not-allowed disabled:opacity-60"
        />
        {(attachments.length > 0 || uploadError) && (
          <div className="flex max-h-24 flex-wrap gap-2 overflow-y-auto">
            {attachments.map((attachment) => (
              <AdminAiAttachmentChip
                key={attachment.referenceId}
                attachment={attachment}
                disabled={isBusy || isUploadingFile}
                onRemove={onRemoveAttachment}
              />
            ))}
            {uploadError && (
              <span className="inline-flex min-h-8 items-center rounded-lg bg-[var(--admin-danger)]/10 px-2.5 text-xs font-medium text-[var(--admin-danger)]">
                {uploadError}
              </span>
            )}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={disabled || isBusy || isUploadingFile}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-secondary)] text-[var(--admin-text-secondary)] transition hover:border-[var(--admin-accent)] hover:text-[var(--admin-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-accent)] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Đính kèm file"
            >
              <Paperclip className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-[var(--admin-accent-light)] px-3 text-xs font-medium text-[var(--admin-accent)]">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Thao tác ghi cần xác nhận
            </div>
          </div>
          <button
            type="submit"
            disabled={disabled || isBusy || isUploadingFile}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--admin-accent)] px-4 py-2 text-sm font-semibold text-[var(--admin-bg-elevated)] transition hover:bg-[var(--admin-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-accent)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SendHorizontal className="h-4 w-4" aria-hidden="true" />
            {isBusy ? 'Đang gửi' : 'Gửi'}
          </button>
        </div>
      </div>
    </form>
  )
}
