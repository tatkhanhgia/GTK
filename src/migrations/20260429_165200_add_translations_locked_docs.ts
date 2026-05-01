import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Add translations collection support to payload_locked_documents_rels.
 *
 * The initial migration (20260406_073308) predates the Translations
 * collection. On fresh DBs that collection's table is created by the
 * custom bootstrap script, but the internal Payload relation table
 * still needs the translations_id column + FK so locked-document
 * features work correctly.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Ensure translations table exists (idempotent; custom bootstrap
    -- may already have created it with an identical schema).
    CREATE TABLE IF NOT EXISTS "translations" (
      "id" serial PRIMARY KEY NOT NULL,
      "key" varchar NOT NULL,
      "vi" varchar NOT NULL,
      "en" varchar NOT NULL,
      "context" varchar,
      "group" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    -- Add missing relation column
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "translations_id" integer;

    -- Add FK constraint (skip if already present)
    DO $$
    BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_translations_fk"
        FOREIGN KEY ("translations_id") REFERENCES "public"."translations"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_table OR duplicate_object THEN
      NULL;
    END $$;

    -- Add index (idempotent)
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_translations_id_idx"
      ON "payload_locked_documents_rels" USING btree ("translations_id");

    -- Ensure unique index on translations.key (Payload expects this)
    CREATE UNIQUE INDEX IF NOT EXISTS "translations_key_idx"
      ON "translations" USING btree ("key");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "payload_locked_documents_rels_translations_id_idx";

    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_translations_fk";

    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "translations_id";
  `)
}
