'use client'

import type { ReactNode } from 'react'

type Props = {
  body: string
}

type TextBlock =
  | { type: 'paragraph'; lines: string[] }
  | { type: 'unordered-list'; items: string[] }
  | { type: 'ordered-list'; items: string[] }

const unorderedListPattern = /^\s*[-*]\s+(.+)$/
const orderedListPattern = /^\s*\d+[.)]\s+(.+)$/
const inlineTokenPattern = /(`[^`]+`|\*\*[^*]+\*\*)/g

function parseBlocks(body: string): TextBlock[] {
  const blocks: TextBlock[] = []
  let paragraphLines: string[] = []
  let currentList: Extract<TextBlock, { type: 'unordered-list' | 'ordered-list' }> | null = null

  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      blocks.push({ type: 'paragraph', lines: paragraphLines })
      paragraphLines = []
    }
  }

  const flushList = () => {
    if (currentList) {
      blocks.push(currentList)
      currentList = null
    }
  }

  for (const rawLine of body.replace(/\r\n/g, '\n').split('\n')) {
    const line = rawLine.trim()
    if (!line) {
      flushParagraph()
      flushList()
      continue
    }

    const unorderedItem = line.match(unorderedListPattern)?.[1]
    if (unorderedItem) {
      flushParagraph()
      if (currentList?.type !== 'unordered-list') flushList()
      currentList ??= { type: 'unordered-list', items: [] }
      currentList.items.push(unorderedItem)
      continue
    }

    const orderedItem = line.match(orderedListPattern)?.[1]
    if (orderedItem) {
      flushParagraph()
      if (currentList?.type !== 'ordered-list') flushList()
      currentList ??= { type: 'ordered-list', items: [] }
      currentList.items.push(orderedItem)
      continue
    }

    flushList()
    paragraphLines.push(line)
  }

  flushParagraph()
  flushList()
  return blocks
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let lastIndex = 0

  for (const match of text.matchAll(inlineTokenPattern)) {
    if (match.index === undefined) continue
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    const token = match[0]
    if (token.startsWith('**')) {
      nodes.push(<strong key={`${keyPrefix}-strong-${match.index}`}>{token.slice(2, -2)}</strong>)
    } else {
      nodes.push(
        <code
          key={`${keyPrefix}-code-${match.index}`}
          className="rounded bg-[var(--admin-bg-tertiary)] px-1 py-0.5 text-[0.85em] text-[var(--admin-text-primary)]"
        >
          {token.slice(1, -1)}
        </code>,
      )
    }

    lastIndex = match.index + token.length
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes
}

function FormattedLines({ lines, blockIndex }: { lines: string[]; blockIndex: number }) {
  return (
    <>
      {lines.map((line, lineIndex) => (
        <span key={`${blockIndex}-${lineIndex}`}>
          {lineIndex > 0 && <br />}
          {renderInline(line, `${blockIndex}-${lineIndex}`)}
        </span>
      ))}
    </>
  )
}

export function AdminAiFormattedMessage({ body }: Props) {
  const blocks = parseBlocks(body)

  if (blocks.length === 0) return null

  return (
    <div className="space-y-3 break-words">
      {blocks.map((block, blockIndex) => {
        if (block.type === 'unordered-list') {
          return (
            <ul key={blockIndex} className="list-disc space-y-1 pl-5">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item, `${blockIndex}-${itemIndex}`)}</li>
              ))}
            </ul>
          )
        }

        if (block.type === 'ordered-list') {
          return (
            <ol key={blockIndex} className="list-decimal space-y-1 pl-5">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item, `${blockIndex}-${itemIndex}`)}</li>
              ))}
            </ol>
          )
        }

        return (
          <p key={blockIndex}>
            <FormattedLines lines={block.lines} blockIndex={blockIndex} />
          </p>
        )
      })}
    </div>
  )
}
