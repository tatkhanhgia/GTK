'use client'

import { Bot, CircleAlert, Cpu, ShieldCheck } from 'lucide-react'
import { AdminAiComposer } from './admin-ai-composer'
import { AdminAiEmptyProfileState } from './admin-ai-empty-profile-state'
import { AdminAiErrorBanner } from './admin-ai-error-banner'
import { AdminAiMessageList } from './admin-ai-message-list'
import { AdminAiSessionPanel } from './admin-ai-session-panel'
import { AdminAiSidePanel } from './admin-ai-side-panel'
import { useAdminAiConsoleState } from './use-admin-ai-console-state'

const promptChips = ['Kiểm tra site health', 'Tìm bài draft cần SEO', 'Xem order lỗi gần đây', 'Đọc Docker logs']

export function AdminAiConsoleShell() {
  const state = useAdminAiConsoleState()

  return (
    <main className="min-h-screen bg-[var(--admin-bg-primary)] px-4 py-5 text-[var(--admin-text-primary)] transition-[margin-left] duration-300 md:ml-[var(--admin-sidebar-width)] md:px-6 lg:px-7">
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] max-w-[1480px] flex-col gap-4">
        <header className="flex flex-col gap-4 border-b border-[var(--admin-border)] pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase text-[var(--admin-text-muted)]">
              <Bot className="h-4 w-4 text-[var(--admin-accent)]" aria-hidden="true" />
              Admin AI
            </p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight text-[var(--admin-text-primary)]">
              AI Ops Console
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--admin-text-secondary)]">
              Trợ lý riêng cho admin: đọc trạng thái site, kiểm tra dữ liệu và đề xuất thao tác có xác nhận.
            </p>
          </div>
          <div className="flex flex-col gap-3 lg:items-end">
            <div className="flex flex-wrap gap-2">
              <StatusBadge icon={ShieldCheck} tone="accent" label="Admin only" />
              <StatusBadge icon={CircleAlert} tone="warning" label="Confirm writes" />
              <StatusBadge icon={Cpu} tone="neutral" label="Docker planned" />
            </div>
            <div className="flex flex-wrap gap-2">
              {promptChips.map((chip) => (
                <button
                  key={chip}
                  className="min-h-10 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-secondary)] px-3 text-sm text-[var(--admin-text-secondary)] transition hover:border-[var(--admin-accent)] hover:text-[var(--admin-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-accent)] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={state.composerDisabled || state.isBusy}
                  onClick={() => state.submitMessage(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </header>

        <section className="flex min-h-[720px] flex-1 flex-col overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] shadow-[var(--admin-shadow-md)] lg:min-h-0 lg:flex-row">
          <AdminAiSessionPanel
            sessions={state.sessions}
            activeSessionId={state.activeSessionId}
            isLoading={state.isLoadingSessions}
            busySessionId={state.busySessionId}
            onCreateSession={state.createSession}
            onOpenSession={state.openSession}
            onDeleteSession={state.deleteSession}
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <AdminAiErrorBanner message={state.error} />
            {state.profiles.length === 0 && !state.isLoadingProfiles && <AdminAiEmptyProfileState />}
            <AdminAiMessageList
              messages={state.messages}
              busyActionId={state.busyActionId}
              onConfirmAction={(id) => state.handleAction(id, 'confirm')}
              onCancelAction={(id) => state.handleAction(id, 'cancel')}
            />
            <AdminAiComposer
              attachments={state.selectedAttachments}
              disabled={state.composerDisabled}
              isBusy={state.isBusy}
              isUploadingFile={state.isUploadingFile}
              uploadError={state.uploadError}
              placeholder={state.composerDisabled ? 'Tạo AI profile trước khi gửi tin nhắn...' : undefined}
              onRemoveAttachment={state.removeSelectedAttachment}
              onSubmit={state.submitMessage}
              onUploadFile={state.uploadFile}
            />
          </div>
          <AdminAiSidePanel
            profiles={state.profiles}
            selectedProfileId={state.selectedProfileId}
            selectedModel={state.selectedModel}
            isLoading={state.isLoadingProfiles}
            onProfileChange={state.changeProfile}
            onModelChange={state.setSelectedModel}
          />
        </section>
      </div>
    </main>
  )
}

type StatusBadgeProps = {
  icon: typeof ShieldCheck
  label: string
  tone: 'accent' | 'neutral' | 'warning'
}

function StatusBadge({ icon: Icon, label, tone }: StatusBadgeProps) {
  const toneClass = {
    accent: 'bg-[var(--admin-accent-light)] text-[var(--admin-accent)]',
    neutral: 'bg-[var(--admin-bg-secondary)] text-[var(--admin-text-secondary)]',
    warning: 'bg-[var(--admin-warning)]/15 text-[var(--admin-warning)]',
  }[tone]

  return (
    <span className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium ${toneClass}`}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </span>
  )
}
