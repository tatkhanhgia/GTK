import { RichTextRenderer } from '@/components/blog/rich-text-renderer'
import { Code2, Link, AtSign, Globe, Video, Mail } from 'lucide-react'
import Image from 'next/image'

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

  return (
    <section className="flex flex-col items-center text-center">
      {avatarUrl && (
        <Image
          src={avatarUrl}
          alt={name}
          width={120}
          height={120}
          className="rounded-full object-cover mb-6"
        />
      )}
      <h1 className="font-heading font-bold text-4xl mb-2">{name}</h1>
      <p className="text-muted-foreground text-lg mb-3">{title}</p>
      {heroSentence && (
        <p className="max-w-2xl text-sm leading-relaxed text-foreground/90 md:text-base mb-6">
          {heroSentence}
        </p>
      )}

      {bio && (
        <div className="text-left w-full mb-8">
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
                className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/50 text-muted-foreground transition-all duration-200 hover:scale-110 hover:bg-primary/20 hover:text-primary"
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
