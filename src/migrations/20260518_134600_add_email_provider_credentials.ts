import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "email_settings"
      ADD COLUMN IF NOT EXISTS "zoho_token_encrypted" varchar,
      ADD COLUMN IF NOT EXISTS "zoho_api_url" varchar DEFAULT 'https://api.zeptomail.com/v1.1/email',
      ADD COLUMN IF NOT EXISTS "cloudflare_api_token_encrypted" varchar,
      ADD COLUMN IF NOT EXISTS "cloudflare_account_id" varchar,
      ADD COLUMN IF NOT EXISTS "cloudflare_api_url" varchar DEFAULT 'https://api.cloudflare.com/client/v4';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "email_settings"
      DROP COLUMN IF EXISTS "cloudflare_api_url",
      DROP COLUMN IF EXISTS "cloudflare_account_id",
      DROP COLUMN IF EXISTS "cloudflare_api_token_encrypted",
      DROP COLUMN IF EXISTS "zoho_api_url",
      DROP COLUMN IF EXISTS "zoho_token_encrypted";
  `)
}
