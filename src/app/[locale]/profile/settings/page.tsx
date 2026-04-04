'use client'

import { useState } from 'react'
import { useSession } from '@/lib/auth/auth-client'
import { updateProfile } from '@/lib/profile/update-profile-action'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CheckCircle } from 'lucide-react'

/**
 * Account settings page — client component because it uses hooks + form state.
 * Auth redirect is handled by the parent ProfileLayout (Server Component).
 */
export default function SettingsPage() {
  const { data: session } = useSession()
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!session) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await updateProfile({
        displayName: displayName || undefined,
        bio: bio || undefined,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Không thể lưu thay đổi. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="font-heading font-semibold text-xl mb-6">Cài đặt tài khoản</h2>

      {saved && (
        <div className="mb-4 p-3 rounded-lg bg-success/10 text-success text-sm flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Đã lưu thay đổi
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
        {/* Email — read-only */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Email</label>
          <input
            type="email"
            value={session.user.email}
            disabled
            className="w-full h-11 px-4 rounded-lg border border-border bg-muted text-sm text-muted-foreground cursor-not-allowed"
          />
        </div>

        {/* Display name */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Tên hiển thị</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={session.user.name}
            maxLength={80}
            className="w-full h-11 px-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Giới thiệu</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={300}
            placeholder="Viết vài dòng về bản thân..."
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={cn(buttonVariants(), 'w-full')}
        >
          {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </form>
    </div>
  )
}
