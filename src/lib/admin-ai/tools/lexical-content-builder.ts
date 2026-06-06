import { AdminAiError } from '../admin-ai-chat-contract'
import { asRecord, getText } from './post-tool-content-utils'

type ContentInline = string | { text?: unknown; url?: unknown }
type LexicalNode = Record<string, unknown>

type ContentPackBlock = {
  type?: unknown
  text?: unknown
  level?: unknown
  items?: unknown
  language?: unknown
  children?: unknown
}

const MAX_BLOCKS = 80
const MAX_LIST_ITEMS = 30

function textNode(text: string): LexicalNode {
  return { detail: 0, format: 0, mode: 'normal', style: '', text, type: 'text', version: 1 }
}

function safeUrl(value: unknown) {
  const url = typeof value === 'string' ? value.trim().slice(0, 500) : ''
  if (!url) return ''
  if (!/^(https?:\/\/|mailto:|\/)/i.test(url)) {
    throw new AdminAiError('BAD_REQUEST', 'Links must use http, https, mailto, or site-relative URLs.', 400)
  }
  return url
}

function inlineNodes(value: unknown): LexicalNode[] {
  const items = Array.isArray(value) ? value as ContentInline[] : [String(value ?? '')]
  return items.flatMap<LexicalNode>((item) => {
    if (typeof item === 'string') return [textNode(item.slice(0, 1200))]
    const record = asRecord(item)
    const text = getText(record.text, 1200)
    const url = safeUrl(record.url)
    if (!text) return []
    if (!url) return [textNode(text)]
    return [{
      type: 'link',
      version: 3,
      fields: { url, linkType: 'custom', newTab: url.startsWith('http') },
      children: [textNode(text)],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
    }]
  })
}

function paragraph(children: unknown) {
  return {
    children: inlineNodes(children),
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    type: 'paragraph',
    version: 1,
    textFormat: 0,
    textStyle: '',
  }
}

function blockToLexical(block: ContentPackBlock) {
  const type = String(block.type ?? 'paragraph')
  if (type === 'paragraph') return paragraph(block.children ?? block.text)
  if (type === 'heading') {
    const level = Number(block.level)
    if (![2, 3, 4].includes(level)) throw new AdminAiError('BAD_REQUEST', 'Headings only support levels 2, 3, and 4.', 400)
    return { ...paragraph(block.children ?? block.text), type: 'heading', tag: `h${level}` }
  }
  if (type === 'quote') return { ...paragraph(block.children ?? block.text), type: 'quote' }
  if (type === 'code') {
    const text = getText(block.text, 8000)
    if (!text) throw new AdminAiError('BAD_REQUEST', 'Code blocks require text.', 400)
    return {
      children: [textNode(text)],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      type: 'code',
      version: 1,
      language: getText(block.language, 40) || 'text',
    }
  }
  if (type === 'list') {
    const items = Array.isArray(block.items) ? block.items.slice(0, MAX_LIST_ITEMS) : []
    if (items.length === 0) throw new AdminAiError('BAD_REQUEST', 'Lists require at least one item.', 400)
    return {
      children: items.map((item, index) => ({
        children: inlineNodes(item),
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        type: 'listitem',
        version: 1,
        value: index + 1,
      })),
      direction: 'ltr' as const,
      format: String(block.level) === 'ordered' ? 'number' : 'bullet',
      indent: 0,
      listType: String(block.level) === 'ordered' ? 'number' : 'bullet',
      start: 1,
      tag: String(block.level) === 'ordered' ? 'ol' : 'ul',
      type: 'list',
      version: 1,
    }
  }
  throw new AdminAiError('BAD_REQUEST', `Unsupported content block type: ${type}`, 400)
}

export function createRichTextFromContentPack(value: unknown) {
  const record = asRecord(value)
  const blocks = Array.isArray(record.blocks) ? record.blocks.slice(0, MAX_BLOCKS) : []
  if (blocks.length === 0) throw new AdminAiError('BAD_REQUEST', 'contentPack.blocks must contain at least one block.', 400)

  return {
    root: {
      children: blocks.map((block) => blockToLexical(asRecord(block))),
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}
