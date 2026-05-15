type PayloadAdminUser = {
  role?: string | null
}

export function isPayloadAdminUser(user: unknown) {
  return Boolean(user && typeof user === 'object' && (user as PayloadAdminUser).role === 'admin')
}
