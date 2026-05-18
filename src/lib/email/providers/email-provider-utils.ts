import type { ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

export interface ParsedEmailAddress {
  email: string
  name?: string
}

const addressPattern = /^(.*?)\s*<([^>]+)>$/

export function parseEmailAddress(value: string): ParsedEmailAddress {
  const match = value.match(addressPattern)
  if (!match) return { email: value.trim() }

  const name = match[1]?.trim().replace(/^["']|["']$/g, '')
  return {
    email: match[2].trim(),
    ...(name ? { name } : {}),
  }
}

export async function renderEmailHtml(react: ReactElement) {
  return `<!doctype html>${renderToStaticMarkup(react)}`
}

export async function readProviderError(response: Response) {
  const text = await response.text()
  if (!text) return response.statusText

  try {
    const body = JSON.parse(text) as { message?: string; errors?: unknown; error?: unknown }
    return body.message || String(body.error || body.errors || text)
  } catch {
    return text
  }
}
