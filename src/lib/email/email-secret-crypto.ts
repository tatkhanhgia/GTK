import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'

const PREFIX = 'enc:v1:'

function getKey() {
  const secret = process.env.EMAIL_SETTINGS_ENCRYPTION_KEY || process.env.PAYLOAD_SECRET
  if (!secret) {
    throw new Error('EMAIL_SETTINGS_ENCRYPTION_KEY is not configured')
  }
  return createHash('sha256').update(secret).digest()
}

export function isEncryptedSecret(value: string) {
  return value.startsWith(PREFIX)
}

export function encryptEmailSecret(value: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${PREFIX}${Buffer.concat([iv, tag, encrypted]).toString('base64')}`
}

export function decryptEmailSecret(value?: string | null) {
  if (!value) return null
  if (!isEncryptedSecret(value)) return value
  const raw = Buffer.from(value.slice(PREFIX.length), 'base64')
  const iv = raw.subarray(0, 12)
  const tag = raw.subarray(12, 28)
  const encrypted = raw.subarray(28)
  const decipher = createDecipheriv('aes-256-gcm', getKey(), iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}

export function maskEmailSecret(value?: string | null) {
  return value ? '********' : ''
}
