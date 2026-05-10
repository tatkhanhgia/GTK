'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useCallback } from 'react'
import { Button } from '@/components/ui/button'

type DocumentWithViewTransition = Document & {
  startViewTransition?: (cb: () => void) => { finished: Promise<void> }
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const handleToggle = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark'
    const doc = document as DocumentWithViewTransition

    // Firefox / older browsers: instant flip
    if (typeof doc.startViewTransition !== 'function') {
      setTheme(next)
      return
    }

    // Chromium / Safari 18+: native crossfade between old & new paint
    doc.startViewTransition(() => setTheme(next))
  }, [theme, setTheme])

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      aria-label="Toggle theme"
      className="h-9 w-9"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-[opacity,transform] duration-200 ease-enter dark:-rotate-90 dark:scale-0 dark:opacity-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 opacity-0 transition-[opacity,transform] duration-200 ease-enter dark:rotate-0 dark:scale-100 dark:opacity-100" />
    </Button>
  )
}
