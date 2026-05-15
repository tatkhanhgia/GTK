import { readFileSync } from 'fs'
import { describe, expect, it, vi } from 'vitest'

const insertedValues: Record<string, unknown>[] = []

vi.mock('@payload-config', () => ({ default: {} }))

vi.mock('nanoid', () => ({
  nanoid: vi
    .fn()
    .mockReturnValueOnce('reset-token')
    .mockReturnValueOnce('verification-row-id'),
}))

vi.mock('payload', () => ({
  getPayload: vi.fn().mockResolvedValue({
    db: {
      drizzle: {
        select: () => ({
          from: () => ({
            where: () => ({
              limit: (limit: number) => Promise.resolve(limit === 1 ? [{ id: 'user-123' }] : []),
            }),
          }),
        }),
        insert: () => ({
          values: (value: Record<string, unknown>) => {
            insertedValues.push(value)
            return Promise.resolve()
          },
        }),
      },
    },
  }),
}))

describe('site-user-admin-service', () => {
  it('stores admin reset tokens in Better Auth lookup format', async () => {
    const { createPasswordResetToken } = await import('@/lib/admin/site-user-admin-service')

    const token = await createPasswordResetToken('user-123')

    expect(token).toBe('reset-token')
    expect(insertedValues[0]).toMatchObject({
      id: 'verification-row-id',
      identifier: 'reset-password:reset-token',
      value: 'user-123',
    })
  })

  it('rejects empty admin reset user ids', async () => {
    const { createPasswordResetToken } = await import('@/lib/admin/site-user-admin-service')

    await expect(createPasswordResetToken('')).rejects.toThrow('User id is required')
  })

  it('keeps the EmailSettings global migration-backed', () => {
    const migration = readFileSync(
      'src/migrations/20260514_003500_member_email_settings_site_users.ts',
      'utf8',
    )
    const providerMigration = readFileSync(
      'src/migrations/20260515_140500_add_email_settings_provider.ts',
      'utf8',
    )
    const migrationIndex = readFileSync('src/migrations/index.ts', 'utf8')

    expect(migration).toContain('CREATE TABLE IF NOT EXISTS "email_settings"')
    expect(migration).toContain('"resend_api_key_encrypted"')
    expect(migration).toContain('DROP TABLE IF EXISTS "email_settings"')
    expect(providerMigration).toContain('ADD COLUMN IF NOT EXISTS "provider"')
    expect(providerMigration).toContain("DEFAULT 'resend' NOT NULL")
    expect(providerMigration).toContain('export async function up')
    expect(providerMigration).toContain('export async function down')
    expect(migrationIndex).toContain('20260515_140500_add_email_settings_provider')
    expect(migrationIndex).toContain('up: migration_20260515_140500_add_email_settings_provider.up')
    expect(migrationIndex).toContain('down: migration_20260515_140500_add_email_settings_provider.down')
  })

  it('keeps site member row edit forms valid for table markup', () => {
    const page = readFileSync('src/app/(payload)/admin/site-users/page.tsx', 'utf8')

    expect(page).not.toContain('<form action={saveSiteUser} className="contents">')
    expect(page).toContain('form={saveFormId}')
    expect(page).toContain('id={`save-site-user-${member.id}`}')
  })
})
