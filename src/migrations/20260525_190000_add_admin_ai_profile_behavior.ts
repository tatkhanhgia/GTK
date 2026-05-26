import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "admin_ai_profiles"
      ADD COLUMN IF NOT EXISTS "agent_role" varchar,
      ADD COLUMN IF NOT EXISTS "communication_style" varchar,
      ADD COLUMN IF NOT EXISTS "operational_context" varchar,
      ADD COLUMN IF NOT EXISTS "tool_usage_rules" varchar,
      ADD COLUMN IF NOT EXISTS "custom_instructions" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "admin_ai_profiles"
      DROP COLUMN IF EXISTS "custom_instructions",
      DROP COLUMN IF EXISTS "tool_usage_rules",
      DROP COLUMN IF EXISTS "operational_context",
      DROP COLUMN IF EXISTS "communication_style",
      DROP COLUMN IF EXISTS "agent_role";
  `)
}
