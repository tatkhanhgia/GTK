'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Locale } from '@/i18n/config'

const TOPICS = ['AI', 'Next.js', 'Payload', 'Products']
const DEFAULT_DISPLAY_MS = 1760
const REDUCED_MOTION_DISPLAY_MS = 520

interface HomepageEntryLoaderProps {
  locale: Locale
}

function getDisplayDuration() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? REDUCED_MOTION_DISPLAY_MS
    : DEFAULT_DISPLAY_MS
}

function isPrimaryNavigationClick(event: MouseEvent) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
}

function isHomepageHref(href: string, locale: Locale) {
  try {
    const url = new URL(href, window.location.href)

    if (url.origin !== window.location.origin) {
      return false
    }

    const pathname = url.pathname.replace(/\/$/, '') || '/'

    return pathname === '/' || pathname === `/${locale}`
  } catch {
    return false
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
    let hideTimer = 0

    function showLoader() {
      window.clearTimeout(hideTimer)
      setVisible(true)
      hideTimer = window.setTimeout(
        () => setVisible(false),
        getDisplayDuration(),
      )
    }

    function handleHomepageLinkClick(event: MouseEvent) {
      if (!isPrimaryNavigationClick(event) || !(event.target instanceof Element)) {
        return
      }

      const link = event.target.closest<HTMLAnchorElement>('a[href]')

      if (!link || (link.target && link.target !== '_self') || !isHomepageHref(link.href, locale)) {
        return
      }

      showLoader()
    }

    showLoader()
    document.addEventListener('click', handleHomepageLinkClick)

    return () => {
      window.clearTimeout(hideTimer)
      document.removeEventListener('click', handleHomepageLinkClick)
    }
  }, [locale])

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
