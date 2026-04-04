'use server'

import { getSession } from '@/lib/auth/auth-helpers'

/**
 * Server action: validates password change prerequisites.
 * Actual password update must be performed client-side via Better Auth's
 * `authClient.changePassword()` — the server SDK does not expose a direct
 * password-change API in v1.
 */
export async function changePassword(currentPassword: string, newPassword: string) {
  const session = await getSession()
  if (!session) throw new Error('Not authenticated')

  if (newPassword.length < 8) {
    return { error: 'Mật khẩu mới phải có ít nhất 8 ký tự' }
  }

  if (currentPassword === newPassword) {
    return { error: 'Mật khẩu mới phải khác mật khẩu hiện tại' }
  }

  // Better Auth v1: password change is handled client-side via authClient.changePassword().
  // Signal to the client that it should proceed with the actual API call.
  return { success: true, requireClientAction: true }
}
