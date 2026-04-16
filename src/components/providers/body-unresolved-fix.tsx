'use client'

import { useEffect } from 'react'

/**
 * Removes the body[unresolved] attribute injected by Next.js dev mode
 * to prevent FOUC after hydration. Implemented as a client component
 * so the root layout does not need an inline <script> tag.
 */
export function BodyUnresolvedFix() {
  useEffect(() => {
    const b = document.body
    if (b && b.hasAttribute('unresolved')) {
      b.removeAttribute('unresolved')
    }
  }, [])

  return null
}
