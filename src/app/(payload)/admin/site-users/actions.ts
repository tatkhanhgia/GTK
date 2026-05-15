'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requirePayloadAdmin } from '@/lib/admin/payload-admin-auth'
import { createPasswordResetToken, updateSiteUser, type SiteUserStatus } from '@/lib/admin/site-user-admin-service'

export async function saveSiteUser(formData: FormData) {
  await requirePayloadAdmin()
  await updateSiteUser({
    id: String(formData.get('id') || ''),
    name: String(formData.get('name') || ''),
    email: String(formData.get('email') || ''),
    role: String(formData.get('role') || 'user'),
    status: String(formData.get('status') || 'active') as SiteUserStatus,
  })
  revalidatePath('/admin/site-users')
}

export async function generateSiteUserPasswordReset(formData: FormData) {
  await requirePayloadAdmin()
  const userId = String(formData.get('id') || '')
  const token = await createPasswordResetToken(userId)
  revalidatePath('/admin/site-users')
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`
  redirect(`/admin/site-users?resetUrl=${encodeURIComponent(resetUrl)}`)
}
