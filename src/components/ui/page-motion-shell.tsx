'use client'

import { motion, useReducedMotion } from 'motion/react'
import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import { motionEasings } from '@/lib/motion/motion-presets'

interface PageMotionShellProps {
  children: ReactNode
}

export function PageMotionShell({ children }: PageMotionShellProps) {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted || prefersReducedMotion) {
    return <main className="min-h-[calc(100vh-4rem)]">{children}</main>
  }

  return (
    <motion.main
      key={pathname}
      className="min-h-[calc(100vh-4rem)]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, ease: motionEasings.enter }}
    >
      {children}
    </motion.main>
  )
}
