'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface TocItem {
  id: string
  text: string
  level: number
}

interface Props {
  // Payload Lexical content JSON — dynamic structure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any
  locale?: string
}

/** Recursively extract plain text from a lexical node's children */
function extractText(nodes: unknown[]): string {
  return nodes
    .map((n) => {
      if (!n || typeof n !== 'object') return ''
      const node = n as { text?: string; children?: unknown[] }
      if (node.text) return node.text
      if (node.children) return extractText(node.children)
      return ''
    })
    .join('')
}

/** Walk Payload Lexical AST and collect heading nodes as TOC items */
function extractHeadings(content: unknown): TocItem[] {
  if (!content || typeof content !== 'object') return []
  const root = (content as { root?: { children?: unknown[] } }).root
  if (!root?.children) return []

  const headings: TocItem[] = []

  function walk(nodes: unknown[]) {
    for (const node of nodes) {
      if (!node || typeof node !== 'object') continue
      const n = node as {
        type?: string
        tag?: string
        children?: unknown[]
        text?: string
      }
      if (n.type === 'heading' && n.tag) {
        const level = parseInt(n.tag.replace('h', ''), 10)
        const text = extractText(n.children ?? [])
        if (text) {
          // Produce a stable DOM id matching what the renderer creates
          const id = text
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
          headings.push({ id, text, level })
        }
      }
      if (Array.isArray(n.children)) walk(n.children)
    }
  }

  walk(root.children)
  return headings
}

/**
 * Auto-generated table of contents from Payload Lexical heading nodes.
 * Highlights the active heading using IntersectionObserver.
 * Rendered client-side to support scroll tracking.
 */
export function TableOfContents({ content, locale = 'vi' }: Props) {
  const [activeId, setActiveId] = useState('')
  const headings = extractHeadings(content)

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }
      },
      { rootMargin: '-20% 0% -75% 0%' }
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <div>
      <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
        {locale === 'vi' ? 'Mục lục' : 'Table of Contents'}
      </h3>
      <nav aria-label="Table of contents">
        <ul className="space-y-1">
          {headings.map(({ id, text, level }) => (
            <li key={id} style={{ paddingLeft: `${(level - 2) * 12}px` }}>
              <a
                href={`#${id}`}
                className={cn(
                  'block text-sm py-1 transition-colors hover:text-primary',
                  activeId === id
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground'
                )}
              >
                {text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
