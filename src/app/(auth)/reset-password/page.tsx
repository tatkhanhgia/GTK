'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { authClient } from '@/lib/auth/auth-client'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    if (!token) {
      setError('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn')
      return
    }

    setLoading(true)
    try {
      const result = await authClient.resetPassword({ newPassword, token })
      if (result.error) {
        setError(result.error.message || 'Không thể đặt lại mật khẩu')
      } else {
        router.push('/login')
      }
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 shadow-sm text-center">
        <h1 className="font-heading font-bold text-2xl mb-2">Link không hợp lệ</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
        </p>
        <Link
          href="/forgot-password"
          className={cn(buttonVariants(), 'w-full')}
        >
          Yêu cầu link mới
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
      <div className="text-center mb-8">
        <h1 className="font-heading font-bold text-2xl">Đặt lại mật khẩu</h1>
        <p className="text-muted-foreground text-sm mt-2">
          Nhập mật khẩu mới cho tài khoản của bạn
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        <div className="space-y-1.5">
          <label htmlFor="newPassword" className="text-sm font-medium">Mật khẩu mới</label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
            minLength={8}
            className="w-full h-11 px-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium">Xác nhận mật khẩu</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            minLength={8}
            className="w-full h-11 px-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={cn(buttonVariants(), 'w-full')}
        >
          {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline font-medium">
          Quay lại đăng nhập
        </Link>
      </p>
    </div>
  )
}
