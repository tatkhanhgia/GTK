import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'

const PREFIX = 'admin-ai:enc:v1:'
const MASK = '********'

function getEncryptionKey() {
  const secret = process.env.ADMIN_AI_ENCRYPTION_KEY || process.env.PAYLOAD_SECRET
  if (!secret || (process.env.NODE_ENV === 'production' && secret === 'dev-secret-change-me')) {
    throw new Error('ADMIN_AI_ENCRYPTION_KEY is not configured')
  }
  return createHash('sha256').update(secret).digest()
}

export function isEncryptedAdminAiSecret(value: string) {
  return value.startsWith(PREFIX)
}

export function isMaskedAdminAiSecret(value: unknown) {
  return value === MASK
}

export function encryptAdminAiSecret(value: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${PREFIX}${Buffer.concat([iv, tag, encrypted]).toString('base64')}`
}

export function decryptAdminAiSecret(value?: string | null) {
  if (!value) return null
  if (!isEncryptedAdminAiSecret(value)) return value

  const raw = Buffer.from(value.slice(PREFIX.length), 'base64')
  const iv = raw.subarray(0, 12)
  const tag = raw.subarray(12, 28)
  const encrypted = raw.subarray(28)
  const decipher = createDecipheriv('aes-256-gcm', getEncryptionKey(), iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}

export function maskAdminAiSecret(value?: string | null) {
  return value ? MASK : ''
}
