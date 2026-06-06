import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "admin_ai_sessions" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "admin_user_id" varchar NOT NULL,
      "admin_user_email" varchar,
      "profile_id" varchar,
      "model" varchar,
      "messages" jsonb NOT NULL,
      "last_message_at" timestamp(3) with time zone NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "admin_ai_sessions_id" integer;

    CREATE INDEX IF NOT EXISTS "admin_ai_sessions_admin_user_id_idx"
      ON "admin_ai_sessions" USING btree ("admin_user_id");
    CREATE INDEX IF NOT EXISTS "admin_ai_sessions_last_message_at_idx"
      ON "admin_ai_sessions" USING btree ("last_message_at");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "admin_ai_sessions_id";

    DROP TABLE IF EXISTS "admin_ai_sessions" CASCADE;
  `)
}
