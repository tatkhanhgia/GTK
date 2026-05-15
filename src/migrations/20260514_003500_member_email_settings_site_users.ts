import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "ba_users"
      ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'active' NOT NULL,
      ADD COLUMN IF NOT EXISTS "banned" boolean DEFAULT false NOT NULL,
      ADD COLUMN IF NOT EXISTS "ban_reason" text,
      ADD COLUMN IF NOT EXISTS "ban_expires" timestamp with time zone;

    ALTER TABLE "ba_sessions"
      ADD COLUMN IF NOT EXISTS "impersonated_by" text;

    CREATE TABLE IF NOT EXISTS "email_settings" (
      "id" serial PRIMARY KEY NOT NULL,
      "enabled" boolean DEFAULT true,
      "welcome_email_enabled" boolean DEFAULT true,
      "from_name" varchar DEFAULT 'GTKBlog',
      "from_email" varchar,
      "reply_to" varchar,
      "resend_api_key_encrypted" varchar,
      "welcome_subject_vi" varchar,
      "welcome_body_vi" varchar,
      "welcome_subject_en" varchar,
      "welcome_body_en" varchar,
      "updated_at" timestamp(3) with time zone,
      "created_at" timestamp(3) with time zone
    );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "email_settings" CASCADE;

    ALTER TABLE "ba_sessions" DROP COLUMN IF EXISTS "impersonated_by";
    ALTER TABLE "ba_users"
      DROP COLUMN IF EXISTS "ban_expires",
      DROP COLUMN IF EXISTS "ban_reason",
      DROP COLUMN IF EXISTS "banned",
      DROP COLUMN IF EXISTS "status";
  `)
}
