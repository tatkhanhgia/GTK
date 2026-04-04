'use client'

import { Link2, XIcon } from 'lucide-react'
import { useState } from 'react'

interface Props {
  title: string
  locale?: string
}

/**
 * Share buttons for blog posts: copy link and Twitter/X share.
 * Uses window.location.href so must be a Client Component.
 */
export function ShareButtons({ title, locale = 'vi' }: Props) {
  const [copied, setCopied] = useState(false)
  const isVi = locale === 'vi'

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).catch(() => {
      // Fallback: ignore clipboard errors (e.g. non-secure context)
    })
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function shareTwitter() {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(window.location.href)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex items-center gap-3 py-6 border-t border-border">
      <span className="text-sm font-medium text-muted-foreground">
        {isVi ? 'Chia sẻ:' : 'Share:'}
      </span>
      <button
        type="button"
        onClick={copyLink}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
      >
        <Link2 className="h-3.5 w-3.5" />
        {copied
          ? isVi
            ? 'Đã sao chép!'
            : 'Copied!'
          : isVi
            ? 'Sao chép liên kết'
            : 'Copy link'}
      </button>
      <button
        type="button"
        onClick={shareTwitter}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
      >
        <XIcon className="h-3.5 w-3.5" />
        Twitter/X
      </button>
    </div>
  )
}
