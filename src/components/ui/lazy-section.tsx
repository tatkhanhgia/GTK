'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface LazySectionProps {
  children: ReactNode
  className?: string
  threshold?: number
  /** Keep visual fade for legacy callers. Prefer ScrollReveal for new motion. */
  animate?: boolean
}

export function LazySection({
  children,
  className,
  threshold = 0.1,
  animate = false,
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        threshold,
        rootMargin: '100px',
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  return (
    <div
      ref={ref}
      className={cn(
        animate && 'transition-opacity duration-300 motion-reduce:transition-none',
        animate && (isVisible ? 'opacity-100' : 'opacity-0'),
        className
      )}
    >
      {isVisible && children}
    </div>
  )
}
