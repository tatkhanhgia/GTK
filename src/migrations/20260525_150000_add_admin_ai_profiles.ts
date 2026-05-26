import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "admin_ai_profiles" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "provider_type" varchar DEFAULT 'openai-compatible' NOT NULL,
      "base_url" varchar NOT NULL,
      "api_key_encrypted" varchar NOT NULL,
      "default_model" varchar NOT NULL,
      "enabled" boolean DEFAULT true,
      "notes" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "admin_ai_profiles_model_options" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "model" varchar NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "admin_ai_action_confirmations" (
      "id" serial PRIMARY KEY NOT NULL,
      "tool_name" varchar NOT NULL,
      "status" varchar DEFAULT 'pending' NOT NULL,
      "admin_user_id" varchar NOT NULL,
      "admin_user_email" varchar,
      "input" jsonb NOT NULL,
      "summary" varchar NOT NULL,
      "expires_at" timestamp(3) with time zone NOT NULL,
      "executed_at" timestamp(3) with time zone,
      "cancelled_at" timestamp(3) with time zone,
      "result" jsonb,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "admin_ai_audit_logs" (
      "id" serial PRIMARY KEY NOT NULL,
      "event" varchar NOT NULL,
      "tool_name" varchar,
      "admin_user_id" varchar,
      "admin_user_email" varchar,
      "input" jsonb,
      "result" jsonb,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

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

    ALTER TABLE "admin_ai_profiles_model_options"
      DROP CONSTRAINT IF EXISTS "admin_ai_profiles_model_options_parent_id_fk";

    ALTER TABLE "admin_ai_profiles_model_options"
      ADD CONSTRAINT "admin_ai_profiles_model_options_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."admin_ai_profiles"("id")
      ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "admin_ai_profiles_id" integer,
      ADD COLUMN IF NOT EXISTS "admin_ai_action_confirmations_id" integer,
      ADD COLUMN IF NOT EXISTS "admin_ai_audit_logs_id" integer,
      ADD COLUMN IF NOT EXISTS "admin_ai_sessions_id" integer;

    CREATE INDEX IF NOT EXISTS "admin_ai_profiles_model_options_order_idx"
      ON "admin_ai_profiles_model_options" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "admin_ai_profiles_model_options_parent_id_idx"
      ON "admin_ai_profiles_model_options" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "admin_ai_profiles_updated_at_idx"
      ON "admin_ai_profiles" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "admin_ai_profiles_created_at_idx"
      ON "admin_ai_profiles" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "admin_ai_confirmations_status_idx"
      ON "admin_ai_action_confirmations" USING btree ("status");
    CREATE INDEX IF NOT EXISTS "admin_ai_confirmations_expires_at_idx"
      ON "admin_ai_action_confirmations" USING btree ("expires_at");
    CREATE INDEX IF NOT EXISTS "admin_ai_audit_logs_created_at_idx"
      ON "admin_ai_audit_logs" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "admin_ai_sessions_admin_user_id_idx"
      ON "admin_ai_sessions" USING btree ("admin_user_id");
    CREATE INDEX IF NOT EXISTS "admin_ai_sessions_last_message_at_idx"
      ON "admin_ai_sessions" USING btree ("last_message_at");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "admin_ai_sessions_id",
      DROP COLUMN IF EXISTS "admin_ai_audit_logs_id",
      DROP COLUMN IF EXISTS "admin_ai_action_confirmations_id",
      DROP COLUMN IF EXISTS "admin_ai_profiles_id";

    DROP TABLE IF EXISTS "admin_ai_sessions" CASCADE;
    DROP TABLE IF EXISTS "admin_ai_profiles_model_options" CASCADE;
    DROP TABLE IF EXISTS "admin_ai_audit_logs" CASCADE;
    DROP TABLE IF EXISTS "admin_ai_action_confirmations" CASCADE;
    DROP TABLE IF EXISTS "admin_ai_profiles" CASCADE;
  `)
}
