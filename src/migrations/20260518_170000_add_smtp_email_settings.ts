import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "email_settings"
      ADD COLUMN IF NOT EXISTS "smtp_host" varchar DEFAULT 'smtppro.zoho.com',
      ADD COLUMN IF NOT EXISTS "smtp_port" numeric DEFAULT 465,
      ADD COLUMN IF NOT EXISTS "smtp_secure" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "smtp_user" varchar,
      ADD COLUMN IF NOT EXISTS "smtp_password_encrypted" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "email_settings"
      DROP COLUMN IF EXISTS "smtp_password_encrypted",
      DROP COLUMN IF EXISTS "smtp_user",
      DROP COLUMN IF EXISTS "smtp_secure",
      DROP COLUMN IF EXISTS "smtp_port",
      DROP COLUMN IF EXISTS "smtp_host";
  `)
}
