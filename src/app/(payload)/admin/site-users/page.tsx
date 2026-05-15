import Link from 'next/link'
import { requirePayloadAdmin } from '@/lib/admin/payload-admin-auth'
import { listSiteUsers } from '@/lib/admin/site-user-admin-service'
import { generateSiteUserPasswordReset, saveSiteUser } from './actions'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{ q?: string; role?: string; status?: string; resetUrl?: string }>
}

type SiteMember = {
  id: string
  email: string
  name: string
  role: string
  status?: string
  updatedAt?: Date
}

export default async function SiteUsersPage({ searchParams }: Props) {
  await requirePayloadAdmin()
  const params = await searchParams
  const users = await listSiteUsers({ query: params.q, role: params.role, status: params.status })
  const siteMembers = users as SiteMember[]

  return (
    <main className="min-h-screen bg-[var(--admin-bg-primary)] px-6 py-8 text-[var(--admin-text-primary)] lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--admin-text-muted)]">GTKBlog</p>
            <h1 className="mt-1 text-2xl font-semibold">Site Members</h1>
          </div>
          <Link href="/admin" className="rounded-lg border border-[var(--admin-border)] px-4 py-2 text-sm">Back to admin</Link>
        </div>

        {params.resetUrl && (
          <div className="mb-6 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-secondary)] p-4 text-sm">
            <p className="font-medium">Password reset link</p>
            <code className="mt-2 block break-all rounded-md bg-[var(--admin-bg-primary)] p-3">{params.resetUrl}</code>
          </div>
        )}

        <form className="mb-6 grid gap-3 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-secondary)] p-4 md:grid-cols-4">
          <input name="q" defaultValue={params.q || ''} placeholder="Search email or name" className="h-10 rounded-md border border-[var(--admin-border)] bg-[var(--admin-bg-primary)] px-3 text-sm" />
          <select name="role" defaultValue={params.role || ''} className="h-10 rounded-md border border-[var(--admin-border)] bg-[var(--admin-bg-primary)] px-3 text-sm">
            <option value="">All roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <select name="status" defaultValue={params.status || ''} className="h-10 rounded-md border border-[var(--admin-border)] bg-[var(--admin-bg-primary)] px-3 text-sm">
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="deactivated">Deactivated</option>
          </select>
          <button className="h-10 rounded-md bg-[var(--admin-accent)] px-4 text-sm font-medium text-white">Filter</button>
        </form>

        <div className="overflow-x-auto rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-secondary)]">
          <div className="hidden">
            {siteMembers.map((member) => (
              <form key={member.id} id={`save-site-user-${member.id}`} action={saveSiteUser} />
            ))}
          </div>
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-[var(--admin-border)] text-xs uppercase text-[var(--admin-text-muted)]">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3">Save</th>
                <th className="px-4 py-3">Reset</th>
              </tr>
            </thead>
            <tbody>
              {siteMembers.map((member) => {
                const saveFormId = `save-site-user-${member.id}`

                return (
                  <tr key={member.id} className="border-b border-[var(--admin-border)] last:border-0">
                    <td className="px-4 py-3">
                      <input form={saveFormId} type="hidden" name="id" value={member.id} />
                      <input form={saveFormId} name="email" defaultValue={member.email} className="h-9 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-bg-primary)] px-2" />
                    </td>
                    <td className="px-4 py-3"><input form={saveFormId} name="name" defaultValue={member.name} className="h-9 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-bg-primary)] px-2" /></td>
                    <td className="px-4 py-3">
                      <select form={saveFormId} name="role" defaultValue={member.role} className="h-9 rounded-md border border-[var(--admin-border)] bg-[var(--admin-bg-primary)] px-2">
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select form={saveFormId} name="status" defaultValue={member.status || 'active'} className="h-9 rounded-md border border-[var(--admin-border)] bg-[var(--admin-bg-primary)] px-2">
                        <option value="active">Active</option>
                        <option value="deactivated">Deactivated</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-[var(--admin-text-muted)]">{member.updatedAt?.toLocaleString?.() || ''}</td>
                    <td className="px-4 py-3"><button form={saveFormId} type="submit" className="rounded-md bg-[var(--admin-accent)] px-3 py-2 text-xs font-medium text-white">Save</button></td>
                    <td className="px-4 py-3">
                      <form action={generateSiteUserPasswordReset}>
                        <input type="hidden" name="id" value={member.id} />
                        <button className="rounded-md border border-[var(--admin-border)] px-3 py-2 text-xs font-medium">Reset link</button>
                      </form>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
