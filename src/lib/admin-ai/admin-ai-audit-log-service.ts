const SECRET_KEYS = ['apikey', 'api_key', 'authorization', 'cookie', 'token', 'secret', 'password']
const REDACTED = '[redacted]'

type PayloadAuditClient = {
  create: (args: { collection: string; data: Record<string, unknown>; [key: string]: unknown }) => Promise<unknown>
}

type AuditArgs = {
  event: string
  toolName?: string
  adminUser?: unknown
  input?: unknown
  result?: unknown
}

function getAdminField(user: unknown, key: 'id' | 'email') {
  if (!user || typeof user !== 'object') return undefined
  const value = (user as Record<string, unknown>)[key]
  return typeof value === 'string' || typeof value === 'number' ? String(value) : undefined
}

export function redactAdminAiAuditValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactAdminAiAuditValue)
  if (!value || typeof value !== 'object') return value

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
      key,
      SECRET_KEYS.some((secretKey) => key.toLowerCase().includes(secretKey))
        ? REDACTED
        : redactAdminAiAuditValue(nested),
    ]),
  )
}

export async function writeAdminAiAuditLog(payload: PayloadAuditClient, args: AuditArgs) {
  await payload.create({
    collection: 'admin-ai-audit-logs',
    data: {
      event: args.event,
      toolName: args.toolName,
      adminUserId: getAdminField(args.adminUser, 'id'),
      adminUserEmail: getAdminField(args.adminUser, 'email'),
      input: redactAdminAiAuditValue(args.input),
      result: redactAdminAiAuditValue(args.result),
    },
  })
}
