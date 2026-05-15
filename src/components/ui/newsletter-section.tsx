'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type NewsletterStatus = 'idle' | 'loading' | 'success' | 'error' | 'rate-limit'

interface NewsletterSectionProps {
  locale: string
}

export function NewsletterSection({ locale }: NewsletterSectionProps) {
  const isVi = locale === 'vi'
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<NewsletterStatus>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) return

    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, locale }),
      })

      const result = (await response.json().catch(() => null)) as { error?: string } | null

      if (response.ok) {
        setStatus('success')
        setMessage(
          isVi
            ? 'Cảm ơn! Vui lòng kiểm tra email để xác nhận đăng ký.'
            : 'Thanks! Please check your email to confirm your subscription.'
        )
        setEmail('')
        return
      }

      if (response.status === 429) {
        setStatus('rate-limit')
        setMessage(
          result?.error ||
            (isVi ? 'Bạn thao tác quá nhanh. Vui lòng thử lại sau.' : 'Too many attempts. Please try again later.')
        )
        return
      }

      setStatus('error')
      setMessage(
        result?.error ||
          (isVi ? 'Đăng ký thất bại. Vui lòng thử lại.' : 'Subscription failed. Please try again.')
      )
    } catch {
      setStatus('error')
      setMessage(isVi ? 'Không thể kết nối tới máy chủ.' : 'Could not connect to the server.')
    }
  }

  return (
    <section className="gradient-brand-subtle relative overflow-hidden rounded-3xl border border-border/60 px-6 py-12 text-center md:px-10">
      <div className="ambient-warm absolute inset-0" />
      <div className="relative z-10 mx-auto max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Newsletter</p>
        <h3 className="mt-3 font-heading text-2xl font-semibold md:text-3xl">
          {isVi ? 'Đăng ký nhận bài viết mới' : 'Subscribe to new posts'}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          {isVi
            ? 'Nhận thông báo khi GTKBlog có bài viết mới về AI, công nghệ và sản phẩm số.'
            : 'Get notified when GTKBlog publishes new posts about AI, technology, and digital products.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Input
            id="newsletter-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              if (status !== 'idle') {
                setStatus('idle')
                setMessage('')
              }
            }}
            placeholder={isVi ? 'Nhập email của bạn' : 'Enter your email'}
            className="h-11 rounded-xl bg-background/90 px-4"
            disabled={status === 'loading'}
          />
          <Button type="submit" size="lg" className="h-11 rounded-xl px-5" disabled={status === 'loading'}>
            {status === 'loading'
              ? isVi
                ? 'Đang gửi...'
                : 'Submitting...'
              : isVi
                ? 'Đăng ký'
                : 'Subscribe'}
          </Button>
        </form>

        {message && (
          <p
            className={`mt-3 text-sm ${
              status === 'success'
                ? 'text-success'
                : status === 'rate-limit' || status === 'error'
                  ? 'text-destructive'
                  : 'text-muted-foreground'
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </section>
  )
}
