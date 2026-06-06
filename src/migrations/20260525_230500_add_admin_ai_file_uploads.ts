import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "admin_ai_files" (
      "id" serial PRIMARY KEY NOT NULL,
      "checksum" varchar NOT NULL,
      "original_filename" varchar NOT NULL,
      "mime_type" varchar NOT NULL,
      "byte_size" numeric NOT NULL,
      "status" varchar DEFAULT 'ready' NOT NULL,
      "deleted_at" timestamp(3) with time zone,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "admin_ai_file_references" (
      "id" serial PRIMARY KEY NOT NULL,
      "file_id" integer NOT NULL,
      "admin_user_id" varchar NOT NULL,
      "admin_user_email" varchar,
      "session_id" varchar,
      "display_name" varchar NOT NULL,
      "deleted_at" timestamp(3) with time zone,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "admin_ai_file_chunks" (
      "id" serial PRIMARY KEY NOT NULL,
      "file_id" integer NOT NULL,
      "chunk_index" numeric NOT NULL,
      "content" varchar NOT NULL,
      "char_start" numeric NOT NULL,
      "char_end" numeric NOT NULL,
      "checksum" varchar NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    DO $$
    BEGIN
      ALTER TABLE "admin_ai_file_references"
        ADD CONSTRAINT "admin_ai_file_references_file_id_admin_ai_files_id_fk"
        FOREIGN KEY ("file_id") REFERENCES "public"."admin_ai_files"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END $$;

    DO $$
    BEGIN
      ALTER TABLE "admin_ai_file_chunks"
        ADD CONSTRAINT "admin_ai_file_chunks_file_id_admin_ai_files_id_fk"
        FOREIGN KEY ("file_id") REFERENCES "public"."admin_ai_files"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END $$;

    DROP INDEX IF EXISTS "admin_ai_files_checksum_idx";
    CREATE UNIQUE INDEX "admin_ai_files_checksum_idx"
      ON "admin_ai_files" USING btree ("checksum")
      WHERE "deleted_at" IS NULL;
    CREATE INDEX IF NOT EXISTS "admin_ai_files_deleted_at_idx"
      ON "admin_ai_files" USING btree ("deleted_at");
    CREATE INDEX IF NOT EXISTS "admin_ai_file_references_admin_user_id_idx"
      ON "admin_ai_file_references" USING btree ("admin_user_id");
    CREATE INDEX IF NOT EXISTS "admin_ai_file_references_session_id_idx"
      ON "admin_ai_file_references" USING btree ("session_id");
    CREATE INDEX IF NOT EXISTS "admin_ai_file_references_deleted_at_idx"
      ON "admin_ai_file_references" USING btree ("deleted_at");
    CREATE INDEX IF NOT EXISTS "admin_ai_file_chunks_file_id_chunk_index_idx"
      ON "admin_ai_file_chunks" USING btree ("file_id", "chunk_index");

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "admin_ai_files_id" integer,
      ADD COLUMN IF NOT EXISTS "admin_ai_file_references_id" integer,
      ADD COLUMN IF NOT EXISTS "admin_ai_file_chunks_id" integer;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "admin_ai_file_chunks_id",
      DROP COLUMN IF EXISTS "admin_ai_file_references_id",
      DROP COLUMN IF EXISTS "admin_ai_files_id";

    DROP TABLE IF EXISTS "admin_ai_file_chunks" CASCADE;
    DROP TABLE IF EXISTS "admin_ai_file_references" CASCADE;
    DROP TABLE IF EXISTS "admin_ai_files" CASCADE;
  `)
}
