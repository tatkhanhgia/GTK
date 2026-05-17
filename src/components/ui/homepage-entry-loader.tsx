'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Locale } from '@/i18n/config'

const TOPICS = ['AI', 'Next.js', 'Payload', 'Products']
const SESSION_STORAGE_KEY = 'gtkblog.homepageEntryLoader.seen'

interface HomepageEntryLoaderProps {
  locale: Locale
}

function hasSeenHomepageEntryLoader() {
  try {
    return window.sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function markHomepageEntryLoaderSeen() {
  try {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, 'true')
  } catch {
    // Storage is best-effort; blocked storage should not prevent the homepage from rendering.
  }
}

export function HomepageEntryLoader({ locale }: HomepageEntryLoaderProps) {
  const [visible, setVisible] = useState(false)
  const label =
    locale === 'vi'
      ? 'Dang mo GTKBlog'
      : 'Opening GTKBlog'
  const sublabel =
    locale === 'vi'
      ? 'Ghi chu ky thuat, AI workflow, san pham so'
      : 'Technical notes, AI workflows, digital products'

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const hasSeenLoader = hasSeenHomepageEntryLoader()

    if (hasSeenLoader) {
      return
    }

    markHomepageEntryLoaderSeen()
    setVisible(true)

    const hideTimer = window.setTimeout(
      () => setVisible(false),
      prefersReducedMotion ? 520 : 1760,
    )

    return () => window.clearTimeout(hideTimer)
  }, [])

  if (!visible) return null

  return (
    <div
      className="homepage-entry-loader fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-background text-foreground"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="homepage-entry-loader__field" aria-hidden="true" />
      <div className="homepage-entry-loader__grain" aria-hidden="true" />

      <div className="relative z-10 grid w-full max-w-[min(42rem,calc(100vw-2rem))] gap-8 px-4 text-center">
        <div className="homepage-entry-loader__mark mx-auto" aria-hidden="true">
          <span className="homepage-entry-loader__mark-ring" />
          <span className="homepage-entry-loader__mark-core">GTK</span>
        </div>

        <div className="grid gap-3">
          <p className="font-heading text-[clamp(2.4rem,12vw,6.25rem)] font-bold leading-none tracking-normal">
            GTKBlog
          </p>
          <p className="mx-auto max-w-[42ch] text-sm font-medium text-muted-foreground sm:text-base">
            {sublabel}
          </p>
        </div>

        <div className="homepage-entry-loader__topics mx-auto" aria-hidden="true">
          {TOPICS.map((topic, index) => (
            <span
              key={topic}
              className="homepage-entry-loader__topic"
              style={{ '--topic-index': index } as CSSProperties}
            >
              {topic}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
