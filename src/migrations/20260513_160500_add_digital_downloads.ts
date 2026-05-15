import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "digital_downloads" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "description" varchar,
      "version" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "url" varchar,
      "filename" varchar,
      "mime_type" varchar,
      "filesize" numeric,
      "width" numeric,
      "height" numeric,
      "focal_x" numeric,
      "focal_y" numeric
    );

    CREATE INDEX IF NOT EXISTS "digital_downloads_updated_at_idx"
      ON "digital_downloads" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "digital_downloads_created_at_idx"
      ON "digital_downloads" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "digital_downloads_filename_idx"
      ON "digital_downloads" USING btree ("filename");

    INSERT INTO "digital_downloads" (
      "id",
      "title",
      "description",
      "version",
      "updated_at",
      "created_at",
      "url",
      "filename",
      "mime_type",
      "filesize",
      "width",
      "height",
      "focal_x",
      "focal_y"
    )
    SELECT
      "m"."id",
      COALESCE(NULLIF("m"."alt", ''), NULLIF("m"."filename", ''), 'Digital download'),
      "m"."caption",
      NULL,
      COALESCE("m"."updated_at", now()),
      COALESCE("m"."created_at", now()),
      "m"."url",
      "m"."filename",
      "m"."mime_type",
      "m"."filesize",
      "m"."width",
      "m"."height",
      "m"."focal_x",
      "m"."focal_y"
    FROM "media" "m"
    WHERE "m"."id" IN (
      SELECT "download_file_id" FROM "products" WHERE "download_file_id" IS NOT NULL
      UNION
      SELECT "version_download_file_id" FROM "_products_v" WHERE "version_download_file_id" IS NOT NULL
    )
    AND NOT EXISTS (
      SELECT 1 FROM "digital_downloads" "dd" WHERE "dd"."id" = "m"."id"
    );

    SELECT setval(
      pg_get_serial_sequence('"digital_downloads"', 'id'),
      COALESCE((SELECT MAX("id") FROM "digital_downloads"), 1),
      true
    );

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "digital_downloads_id" integer;

    DO $$
    BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_digital_downloads_fk"
        FOREIGN KEY ("digital_downloads_id") REFERENCES "public"."digital_downloads"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END $$;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_digital_downloads_id_idx"
      ON "payload_locked_documents_rels" USING btree ("digital_downloads_id");

    ALTER TABLE "products"
      DROP CONSTRAINT IF EXISTS "products_download_file_id_media_id_fk";

    DO $$
    BEGIN
      ALTER TABLE "products"
        ADD CONSTRAINT "products_download_file_id_digital_downloads_id_fk"
        FOREIGN KEY ("download_file_id") REFERENCES "public"."digital_downloads"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END $$;

    ALTER TABLE "_products_v"
      DROP CONSTRAINT IF EXISTS "_products_v_version_download_file_id_media_id_fk";

    DO $$
    BEGIN
      ALTER TABLE "_products_v"
        ADD CONSTRAINT "_products_v_version_download_file_id_digital_downloads_id_fk"
        FOREIGN KEY ("version_download_file_id") REFERENCES "public"."digital_downloads"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "_products_v"
      DROP CONSTRAINT IF EXISTS "_products_v_version_download_file_id_digital_downloads_id_fk";

    DO $$
    BEGIN
      ALTER TABLE "_products_v"
        ADD CONSTRAINT "_products_v_version_download_file_id_media_id_fk"
        FOREIGN KEY ("version_download_file_id") REFERENCES "public"."media"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END $$;

    ALTER TABLE "products"
      DROP CONSTRAINT IF EXISTS "products_download_file_id_digital_downloads_id_fk";

    DO $$
    BEGIN
      ALTER TABLE "products"
        ADD CONSTRAINT "products_download_file_id_media_id_fk"
        FOREIGN KEY ("download_file_id") REFERENCES "public"."media"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END $$;

    DROP INDEX IF EXISTS "payload_locked_documents_rels_digital_downloads_id_idx";

    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_digital_downloads_fk";

    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "digital_downloads_id";

    DROP TABLE IF EXISTS "digital_downloads" CASCADE;
  `)
}
