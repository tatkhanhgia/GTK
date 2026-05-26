import { AdminAiError } from '../admin-ai-chat-contract'

export const ADMIN_AI_ALLOWED_FILE_EXTENSIONS = ['.md', '.markdown', '.html', '.htm', '.txt'] as const
export const ADMIN_AI_DEFAULT_FILE_CAP_BYTES = 1024 * 1024
export const ADMIN_AI_MAX_FILE_CAP_BYTES = 5 * 1024 * 1024
export const ADMIN_AI_GLOBAL_QUOTA_BYTES = 5 * 1024 * 1024 * 1024
export const ADMIN_AI_MAX_ATTACHMENTS_PER_MESSAGE = 5

const ALLOWED_MIME_TYPES = new Set([
  '',
  'text/html',
  'text/markdown',
  'text/plain',
  'application/octet-stream',
])

export type AdminAiUploadFileInput = {
  name: string
  type?: string
  size: number
  arrayBuffer: () => Promise<ArrayBuffer>
}

export type AdminAiValidatedUpload = {
  filename: string
  extension: string
  mimeType: string
  byteSize: number
  text: string
}

export function getAdminAiFileUploadCapBytes() {
  const configured = Number(process.env.ADMIN_AI_FILE_UPLOAD_MAX_BYTES)
  if (!Number.isFinite(configured) || configured <= 0) return ADMIN_AI_DEFAULT_FILE_CAP_BYTES
  return Math.min(Math.floor(configured), ADMIN_AI_MAX_FILE_CAP_BYTES)
}

function getExtension(filename: string) {
  const dot = filename.lastIndexOf('.')
  return dot >= 0 ? filename.slice(dot).toLowerCase() : ''
}

function hasBinaryMarkers(text: string) {
  if (text.includes('\u0000')) return true
  const sample = text.slice(0, 4096)
  const controls = sample.match(/[\u0001-\u0008\u000b\u000c\u000e-\u001f]/g)
  return Boolean(controls && controls.length > Math.max(8, sample.length * 0.01))
}

export async function validateAdminAiUploadFile(file: AdminAiUploadFileInput): Promise<AdminAiValidatedUpload> {
  const filename = file.name.trim()
  const extension = getExtension(filename)
  const mimeType = file.type || 'text/plain'
  const cap = getAdminAiFileUploadCapBytes()

  if (!filename) throw new AdminAiError('BAD_REQUEST', 'File name is required.', 400)
  if (!ADMIN_AI_ALLOWED_FILE_EXTENSIONS.includes(extension as typeof ADMIN_AI_ALLOWED_FILE_EXTENSIONS[number])) {
    throw new AdminAiError('BAD_REQUEST', 'Only Markdown, HTML, and text files are supported.', 400)
  }
  if (file.size <= 0) throw new AdminAiError('BAD_REQUEST', 'File is empty.', 400)
  if (file.size > cap) throw new AdminAiError('BAD_REQUEST', `File must be ${cap} bytes or smaller.`, 400)
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new AdminAiError('BAD_REQUEST', 'Unsupported file MIME type.', 400)
  }

  let text = ''
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(await file.arrayBuffer())
  } catch {
    throw new AdminAiError('BAD_REQUEST', 'File must be valid UTF-8 text.', 400)
  }

  if (hasBinaryMarkers(text)) throw new AdminAiError('BAD_REQUEST', 'Binary files are not supported.', 400)
  return { filename, extension, mimeType, byteSize: file.size, text }
}
