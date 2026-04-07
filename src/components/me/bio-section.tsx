'use client'

import { RichTextRenderer } from '@/components/blog/rich-text-renderer'
import { Code2, Link, AtSign, Globe, Video, Mail } from 'lucide-react'
import Image from 'next/image'
import { useIsMobile } from '@/hooks/use-media-query'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { cn } from '@/lib/utils'

interface SocialLink {
  platform: 'github' | 'linkedin' | 'x' | 'facebook' | 'youtube' | 'email'
  url: string
}

interface BioSectionProps {
  name: string
  title: string
  heroSentence?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  avatar?: { url?: string } | any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bio?: any
  socialLinks?: SocialLink[]
}

const platformIcons: Record<string, typeof Code2> = {
  github: Code2,
  linkedin: Link,
  x: AtSign,
  facebook: Globe,
  youtube: Video,
  email: Mail,
}

function getSafeHref(link: SocialLink): string | null {
  if (link.platform === 'email') {
    const email = link.url.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null
    return `mailto:${email}`
  }

  try {
    const url = new URL(link.url)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
    return url.toString()
  } catch {
    return null
  }
}

export function BioSection({ name, title, heroSentence, avatar, bio, socialLinks }: BioSectionProps) {
  const avatarUrl = typeof avatar === 'object' && avatar?.url ? avatar.url : null
  const isMobile = useIsMobile()
  const reducedMotion = useReducedMotion()
  const shouldAnimate = !isMobile && !reducedMotion

  return (
    <section className="flex flex-col items-center text-center">
      {avatarUrl && (
        <Image
          src={avatarUrl}
          alt={name}
          width={120}
          height={120}
          className="mb-6 rounded-full object-cover"
        />
      )}
      <h1 className="mb-2 font-heading text-4xl font-bold">{name}</h1>
      <p className="mb-3 text-lg text-muted-foreground">{title}</p>
      {heroSentence && (
        <p className="mb-6 max-w-2xl text-sm leading-relaxed text-foreground/90 md:text-base">
          {heroSentence}
        </p>
      )}

      {bio && (
        <div className="mb-8 w-full text-left">
          <RichTextRenderer content={bio} />
        </div>
      )}

      {socialLinks && socialLinks.length > 0 && (
        <div className="flex items-center gap-3">
          {socialLinks.map((link, i) => {
            const Icon = platformIcons[link.platform] || Mail
            const href = getSafeHref(link)
            if (!href) return null
            return (
              <a
                key={`${link.platform}-${i}`}
                href={href}
                target={link.platform === 'email' ? undefined : '_blank'}
                rel={link.platform === 'email' ? undefined : 'noopener noreferrer'}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full bg-secondary/50 text-muted-foreground transition-colors hover:bg-primary/20 hover:text-primary',
                  'touch-target',
                  shouldAnimate && 'hover:scale-110'
                )}
                aria-label={link.platform}
              >
                <Icon className="h-5 w-5" />
              </a>
            )
          })}
        </div>
      )}
    </section>
  )
}
