import { requirePayloadAdmin } from '@/lib/admin/payload-admin-auth'
import { AdminAiConsoleShell } from '@/admin/components/ai/admin-ai-console-shell'

export const dynamic = 'force-dynamic'

export default async function AdminAiPage() {
  await requirePayloadAdmin()

  return <AdminAiConsoleShell />
}
