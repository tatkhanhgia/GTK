'use client'

import React, { useState, useEffect } from 'react'
import type { AcceptedLanguages } from '@payloadcms/translations'
import { useAdminTranslation } from '../../i18n/use-admin-translation'

/**
 * Renders a [ VI ] [ EN ] button group that switches the Payload admin
 * UI language. SSR-safe: renders a neutral skeleton until mounted.
 *
 * Uses Payload's `switchLanguage` server action which sets the language
 * cookie and re-renders all i18n consumers without a full page reload.
 */
export function LanguageSwitcherClient() {
  const { t, i18n, switchLanguage } = useAdminTranslation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Read the persisted cookie synchronously to avoid a flash for users who
  // previously chose EN. SSR always produces 'vi'; suppressHydrationWarning
  // below suppresses the expected mismatch on first paint.
  const initialLang =
    typeof document !== 'undefined'
      ? ((document.cookie.match(/payload-lng=([^;]+)/)?.[1] ?? 'vi') as 'vi' | 'en')
      : 'vi'
  const currentLang = mounted ? (i18n.language as 'vi' | 'en') : initialLang

  const handleSwitch = (lang: 'vi' | 'en') => {
    if (lang !== i18n.language && switchLanguage) {
      void switchLanguage(lang as AcceptedLanguages)
    }
  }

  const buttonBase = `
    relative inline-flex h-8 items-center justify-center px-2.5
    text-xs font-semibold tracking-wide uppercase
    border transition-all duration-200 active:scale-95
  `
  const activeStyle = `
    border-[var(--admin-accent)] bg-[var(--admin-accent-light)]
    text-[var(--admin-accent)]
  `
  const inactiveStyle = `
    border-[var(--admin-border)]
    bg-gradient-to-br from-[var(--admin-bg-secondary)] to-[var(--admin-bg-tertiary)]
    text-[var(--admin-text-muted)]
    hover:border-[var(--admin-accent)]/40 hover:text-[var(--admin-accent)]
  `

  return (
    <div
      className="flex overflow-hidden rounded-xl border border-[var(--admin-border)]"
      aria-label={mounted ? t('customHeader:langSwitcherLabel') : 'Language'}
      role="group"
      suppressHydrationWarning
    >
      {(['vi', 'en'] as const).map((lang, idx) => (
        <button
          key={lang}
          type="button"
          onClick={() => handleSwitch(lang)}
          className={[
            buttonBase,
            currentLang === lang ? activeStyle : inactiveStyle,
            idx === 0 ? 'rounded-r-none border-r-0' : 'rounded-l-none',
          ].join(' ')}
          aria-pressed={currentLang === lang}
          aria-label={
            lang === 'vi'
              ? mounted
                ? t('customHeader:langSwitcherVi')
                : 'Tiếng Việt'
              : mounted
                ? t('customHeader:langSwitcherEn')
                : 'English'
          }
          suppressHydrationWarning
        >
          {lang === 'vi' ? 'VI' : 'EN'}
        </button>
      ))}
    </div>
  )
}
