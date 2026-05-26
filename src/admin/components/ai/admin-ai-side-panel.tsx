'use client'

import Link from 'next/link'
import { Activity, Database, LockKeyhole, MessageSquareText, ServerCog, SlidersHorizontal } from 'lucide-react'
import type { AdminAiSafeProfile } from '@/lib/admin-ai/admin-ai-chat-contract'

const statusItems = [
  { label: 'Health API', value: 'Sẵn sàng', icon: Activity, tone: 'text-[var(--admin-success)]' },
  { label: 'Database tools', value: 'Đã lên plan', icon: Database, tone: 'text-[var(--admin-info)]' },
  { label: 'Docker ops', value: 'Cần runner', icon: ServerCog, tone: 'text-[var(--admin-warning)]' },
]

const actionPolicy = ['Tool đọc chạy trực tiếp', 'Tool ghi cần xác nhận', 'Ops chỉ dùng Docker runner cho phép']

function previewText(value?: string) {
  if (!value) return 'Chưa cấu hình riêng cho profile này.'
  return value.length > 150 ? `${value.slice(0, 150).trim()}...` : value
}

type Props = {
  profiles: AdminAiSafeProfile[]
  selectedProfileId: string
  selectedModel: string
  isLoading?: boolean
  onProfileChange: (profileId: string) => void
  onModelChange: (model: string) => void
}

export function AdminAiSidePanel({
  profiles,
  selectedProfileId,
  selectedModel,
  isLoading = false,
  onProfileChange,
  onModelChange,
}: Props) {
  const selectedProfile = profiles.find((profile) => profile.id === selectedProfileId)
  const models = selectedProfile
    ? Array.from(new Set([selectedProfile.defaultModel, ...selectedProfile.modelOptions].filter(Boolean)))
    : []

  return (
    <aside className="border-t border-[var(--admin-border)] bg-[var(--admin-bg-secondary)] p-4 lg:w-[348px] lg:border-l lg:border-t-0">
      <section className="border-b border-[var(--admin-border)] pb-5">
        <div className="mb-4 flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-[var(--admin-accent)]" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-[var(--admin-text-primary)]">AI profile</h2>
        </div>
        <label className="text-xs font-medium text-[var(--admin-text-secondary)]" htmlFor="ai-profile">Provider</label>
        <select
          id="ai-profile"
          value={selectedProfileId}
          disabled={isLoading || profiles.length === 0}
          onChange={(event) => onProfileChange(event.target.value)}
          className="mt-2 h-11 w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-tertiary)] px-3 text-sm text-[var(--admin-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-accent)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {profiles.length === 0 && <option value="">Chưa có profile</option>}
          {profiles.map((profile) => (
            <option key={profile.id} value={profile.id}>{profile.name}</option>
          ))}
        </select>
        <label className="mt-4 block text-xs font-medium text-[var(--admin-text-secondary)]" htmlFor="ai-model">Model</label>
        <select
          id="ai-model"
          value={selectedModel}
          disabled={models.length === 0}
          onChange={(event) => onModelChange(event.target.value)}
          className="mt-2 h-11 w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-tertiary)] px-3 text-sm text-[var(--admin-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-accent)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {models.length === 0 && <option value="">Configured per profile</option>}
          {models.map((model) => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>
        <Link
          href={selectedProfile ? `/admin/collections/admin-ai-profiles/${selectedProfile.id}` : '/admin/collections/admin-ai-profiles'}
          className="mt-4 inline-flex min-h-10 items-center rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-tertiary)] px-3 text-sm font-medium text-[var(--admin-text-primary)] hover:border-[var(--admin-border-strong)]"
        >
          Chỉnh profile
        </Link>
      </section>

      <section className="border-b border-[var(--admin-border)] py-5">
        <div className="mb-3 flex items-center gap-2">
          <MessageSquareText className="h-5 w-5 text-[var(--admin-accent)]" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-[var(--admin-text-primary)]">Cách giao tiếp</h2>
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-xs font-medium uppercase text-[var(--admin-text-secondary)]">Vai trò</p>
            <p className="mt-1 text-[var(--admin-text-primary)]">{previewText(selectedProfile?.agentRole)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-[var(--admin-text-secondary)]">Style</p>
            <p className="mt-1 text-[var(--admin-text-primary)]">{previewText(selectedProfile?.communicationStyle)}</p>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--admin-border)] py-5">
        <div className="mb-3 flex items-center gap-2">
          <LockKeyhole className="h-5 w-5 text-[var(--admin-accent)]" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-[var(--admin-text-primary)]">Chính sách thao tác</h2>
        </div>
        <ul className="divide-y divide-[var(--admin-border)] text-sm text-[var(--admin-text-secondary)]">
          {actionPolicy.map((item) => (
            <li key={item} className="py-2">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="pt-5">
        <h2 className="text-sm font-semibold text-[var(--admin-text-primary)]">Trạng thái ops</h2>
        <div className="mt-3 space-y-3">
          {statusItems.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm text-[var(--admin-text-secondary)]">
                  <Icon className={`h-4 w-4 ${item.tone}`} aria-hidden="true" />
                  {item.label}
                </span>
                <span className="text-xs font-medium text-[var(--admin-text-primary)]">{item.value}</span>
              </div>
            )
          })}
        </div>
      </section>
    </aside>
  )
}
