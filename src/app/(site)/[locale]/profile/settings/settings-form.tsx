'use client'

import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { authClient } from '@/lib/auth/auth-client'
import { changePassword } from '@/lib/profile/change-password-action'
import { updateProfile } from '@/lib/profile/update-profile-action'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Settings {
  email: string
  displayName: string
  bio: string
}

export default function SettingsForm({ settings }: { settings: Settings }) {
  const [displayName, setDisplayName] = useState(settings.displayName)
  const [bio, setBio] = useState(settings.bio)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await updateProfile({ displayName, bio })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Không thể lưu thay đổi. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPasswordLoading(true)
    setError(null)
    try {
      const validation = await changePassword(currentPassword, newPassword)
      if (validation.error) {
        setError(validation.error)
        return
      }
      const result = await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true })
      if (result.error) {
        setError(result.error.message || 'Không thể đổi mật khẩu.')
        return
      }
      setCurrentPassword('')
      setNewPassword('')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div>
      <h2 className="font-heading mb-6 text-xl font-semibold">Cài đặt tài khoản</h2>

      {saved && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
          <CheckCircle className="h-4 w-4" />
          Đã lưu thay đổi
        </div>
      )}
      {error && <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <form onSubmit={handleSubmit} className="max-w-md space-y-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Email</label>
          <input type="email" value={settings.email} disabled className="h-11 w-full cursor-not-allowed rounded-lg border border-border bg-muted px-4 text-sm text-muted-foreground" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Tên hiển thị</label>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={80} className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Giới thiệu</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={300} className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <button type="submit" disabled={loading} className={cn(buttonVariants(), 'w-full')}>
          {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="mt-10 max-w-md space-y-6">
        <h3 className="font-heading text-lg font-semibold">Đổi mật khẩu</h3>
        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Mật khẩu hiện tại" className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mật khẩu mới" minLength={8} className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        <button type="submit" disabled={passwordLoading} className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}>
          {passwordLoading ? 'Đang đổi...' : 'Đổi mật khẩu'}
        </button>
      </form>
    </div>
  )
}
