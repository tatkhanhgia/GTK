'use client'

import { useEffect } from 'react'

function removeBodyUnresolved() {
  if (typeof document !== 'undefined' && document.body?.hasAttribute('unresolved')) {
    document.body.removeAttribute('unresolved')
  }
}

function isHydrationMismatch(args: unknown[]): boolean {
  for (const arg of args) {
    const text = typeof arg === 'string' ? arg : arg instanceof Error ? arg.message : String(arg)
    if (
      text.includes('Hydration failed because') ||
      text.includes('hydration mismatch') ||
      text.includes('server rendered HTML') ||
      text.includes('server rendered text') ||
      text.includes('did not match')
    ) {
      return true
    }
  }
  return false
}

/**
 * Payload admin panel frequently triggers hydration mismatch warnings
 * due to browser extensions injecting style tags into <head> or CSS
 * chunk ordering differences between SSR and client (especially via
 * ngrok/tunnel access). This component suppresses those specific
 * warnings in development while leaving other errors intact, and also
 * removes the body[unresolved] attribute so the page doesn't stay blank
 * after a failed hydration.
 */
export function AdminHydrationSuppressor() {
  // Fix body[unresolved] immediately on mount (and before useEffect)
  if (typeof document !== 'undefined') {
    removeBodyUnresolved()
  }

  useEffect(() => {
    removeBodyUnresolved()

    if (process.env.NODE_ENV !== 'development') return

    const originalError = console.error
    console.error = (...args: unknown[]) => {
      if (isHydrationMismatch(args)) {
        removeBodyUnresolved()
        // Suppress admin hydration noise caused by style-tag shifts / dev HMR
        return
      }
      originalError.apply(console, args)
    }

    return () => {
      console.error = originalError
    }
  }, [])

  return null
}
