'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Send, Loader2 } from 'lucide-react'

interface Translations {
  contact: string
  contactName: string
  contactEmail: string
  contactMessage: string
  contactSend: string
  contactSending: string
  contactSuccess: string
  contactError: string
  contactRateLimit: string
}

interface ContactFormProps {
  locale: string
  translations: Translations
  ctaText?: string
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error' | 'rate-limit'

export function ContactForm({ locale, translations: t, ctaText }: ContactFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<FormStatus>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) return

    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim(), locale }),
      })

      if (res.status === 429) {
        setStatus('rate-limit')
        return
      }
      if (!res.ok) {
        setStatus('error')
        return
      }

      setStatus('success')
      setName('')
      setEmail('')
      setMessage('')
    } catch {
      setStatus('error')
    }
  }

  const isLoading = status === 'loading'

  return (
    <section>
      <h2 className="font-heading font-bold text-2xl mb-4">{t.contact}</h2>
      {ctaText && <p className="mb-6 text-sm leading-relaxed text-muted-foreground md:text-base">{ctaText}</p>}
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4" aria-busy={isLoading}>
        <div>
          <label htmlFor="contact-name" className="block text-sm font-medium mb-1">
            {t.contactName}
          </label>
          <input
            id="contact-name"
            type="text"
            required
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="block text-sm font-medium mb-1">
            {t.contactEmail}
          </label>
          <input
            id="contact-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="contact-message" className="block text-sm font-medium mb-1">
            {t.contactMessage}
          </label>
          <textarea
            id="contact-message"
            required
            maxLength={2000}
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
          />
        </div>
        <Button type="submit" disabled={isLoading} className="gap-2">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t.contactSending}
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              {t.contactSend}
            </>
          )}
        </Button>

        {status === 'success' && (
          <p className="text-success text-sm" role="status" aria-live="polite">
            {t.contactSuccess}
          </p>
        )}
        {status === 'error' && (
          <p className="text-destructive text-sm" role="alert" aria-live="assertive">
            {t.contactError}
          </p>
        )}
        {status === 'rate-limit' && (
          <p className="text-destructive text-sm" role="alert" aria-live="assertive">
            {t.contactRateLimit}
          </p>
        )}
      </form>
    </section>
  )
}
