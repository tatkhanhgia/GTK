import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "email_settings"
      ADD COLUMN IF NOT EXISTS "provider" varchar DEFAULT 'resend' NOT NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "email_settings" DROP COLUMN IF EXISTS "provider";
  `)
}
