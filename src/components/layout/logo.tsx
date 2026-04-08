'use client'

import Link from 'next/link'
import Image from 'next/image'

interface LogoProps {
  variant?: 'v1' | 'v2' | 'v3' | 'v4'
  showText?: boolean
  className?: string
}

export function Logo({ variant = 'v1', showText = true, className }: LogoProps) {
  const logoSrc = `/logo-gtkblog-${variant}.svg`

  if (variant === 'v4') {
    // V4 is wordmark only
    return (
      <Link href="/" className={`flex items-center ${className}`}>
        <Image
          src={logoSrc}
          alt="GTKBlog"
          width={160}
          height={60}
          className="h-10 w-auto"
          priority
        />
      </Link>
    )
  }

  return (
    <Link href="/" className={`flex items-center gap-3 ${className}`}>
      <Image
        src={logoSrc}
        alt="GTKBlog"
        width={40}
        height={40}
        className="h-10 w-10"
        priority
      />
      {showText && (
        <span className="font-heading text-xl font-bold gradient-text-brand">
          GTKBlog
        </span>
      )}
    </Link>
  )
}

// Inline SVG version for better performance (no image loading)
export function LogoInline({ showText = true, className }: Omit<LogoProps, 'variant'>) {
  return (
    <Link href="/" className={`flex items-center gap-3 ${className}`}>
      {/* V1 style inline SVG */}
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10"
      >
        <circle cx="100" cy="100" r="90" fill="currentColor" className="text-[#F5F0E8] dark:text-[#1A1A18]" />
        <path
          d="M100 40C67.967 40 42 65.967 42 98s25.967 58 58 58c14.234 0 27.267-5.132 37.406-13.656l-12.39-14.422C118.89 134.332 109.89 138 100 138c-22.056 0-40-17.944-40-40s17.944-40 40-40c9.234 0 17.734 3.156 24.5 8.422l11.2-15.044C125.378 44.578 113.234 40 100 40z"
          fill="#D97757"
        />
        <path d="M95 70h30v12h-9v46h-12V82H95V70z" fill="#C4713E" />
        <circle cx="145" cy="55" r="8" fill="#D97757" opacity="0.6" />
      </svg>
      {showText && (
        <span className="font-heading text-xl font-bold gradient-text-brand">
          GTKBlog
        </span>
      )}
    </Link>
  )
}
