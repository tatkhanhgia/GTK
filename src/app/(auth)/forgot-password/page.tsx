'use client'

import { useState } from 'react'
import Link from 'next/link'
import { authClient } from '@/lib/auth/auth-client'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: '/reset-password',
      })
      if (result.error) {
        setError(result.error.message || 'Không thể gửi email khôi phục')
      } else {
        setSuccess(true)
      }
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 shadow-sm text-center">
        <div className="mb-4 text-4xl">📧</div>
        <h1 className="font-heading font-bold text-2xl mb-2">Kiểm tra email của bạn</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Chúng tôi đã gửi email khôi phục mật khẩu đến <strong>{email}</strong>
        </p>
        <Link
          href="/login"
          className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
        >
          Quay lại đăng nhập
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
      <div className="text-center mb-8">
        <h1 className="font-heading font-bold text-2xl">Quên mật khẩu?</h1>
        <p className="text-muted-foreground text-sm mt-2">
          Nhập email để nhận hướng dẫn khôi phục mật khẩu
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full h-11 px-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={cn(buttonVariants(), 'w-full')}
        >
          {loading ? 'Đang gửi...' : 'Gửi email khôi phục'}
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
